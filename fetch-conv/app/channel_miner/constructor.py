import requests
import json
from app import host
from app.channel_miner.models import Channel, Messages, Members, Users, Pins

class ChannelMiner:
    def __init__(self):
        self.token = ''
        self.endpointChat = '/api/conversations.history'
        self.endpointMembersList = '/api/conversations.members'
        self.endpointPins = '/api/pins.list'
        self.endpointUsersList = '/api/users.list'
        self.endpointChannelList = '/api/conversations.list'

        self.channels = {
            'private': '&types=private_channel',
            'public': '&types=public_channel',
            'im': '&types=im',
            'mpim': '&types=mpim'
        }

    def getToken(self):
        return self.token

    def setToken(self, token):
        self.token = 'token=' + token

    def fetchChats(self, c_id, cursor, latest, limit):
        channel_id = '&channel=' + c_id
        limit = '&limit=' + limit
        nextCursor = ''
        oldestCursor = '&oldest=' + latest

        # if latest == '1':
        #     oldestCursor = '&oldest=1'

        result = {}
        summary = {
            'error': {
                'total': 0,
                'logs': []
            },
            'success': 0,
            'new_chat': 0
        }
        try:
            has_more = True
            dataMessage = []
            new_messages = Messages()

            while has_more:
                request_chats = requests.get(host + self.endpointChat + '?' + self.getToken() + channel_id + limit + oldestCursor + nextCursor)
                result = request_chats.json()

                if result.get('messages'):
                    dataMessage = dataMessage + result['messages']
                    latest = result['messages'][0]['ts']
                    new_messages.addMessages(c_id, result['messages'], cursor, latest)
                    summary['new_chat'] = summary['new_chat'] + len(dataMessage)

                if result.get('has_more'):
                    cursor = result['response_metadata']['next_cursor']
                    nextCursor = '&cursor=' + cursor
                    has_more = True
                else:
                    result['messages'] = dataMessage
                    has_more = False

                summary['success'] = summary['success'] + 1

        except Exception as e:
            print(str(e), 'fetchChats()')
            summary['error']['total'] = summary['error']['total'] + 1
            summary['error']['logs'].append(str(e))
        finally:
            return summary

    def fetchMembers(self, c_id, cursor, limit):
        channel_id = '&channel=' + c_id
        limit = '&limit=' + limit
        nextCursor = '&cursor=' + cursor
        # if cursor == 'first':
        #     nextCursor = ''

        result = {}
        summary = {
            'error': {
                'total': 0,
                'logs': []
            },
            'success': 0,
            'new_members': 0
        }
        try:
            has_more = True
            dataMembers = []
            new_members = Members()

            while has_more:
                request_members = requests.get(host + self.endpointMembersList + '?' + self.getToken() + channel_id + limit + nextCursor)
                result = request_members.json()
                if result.get('members'):
                    dataMembers = dataMembers + result['members']
                    new_members.addMembers(c_id, result['members'], cursor)
                    summary['new_members'] = summary['new_members'] + len(dataMembers)
                if result.get('response_metadata'):
                    if result['response_metadata'].get('next_cursor'):
                        cursor = result['response_metadata']['next_cursor']
                        nextCursor = '&cursor=' + cursor
                        has_more = True
                    else:
                        result['members'] = dataMembers
                        has_more = False
                else:
                    result['members'] = dataMembers
                    has_more = False

                summary['success'] = summary['success'] + 1
        except Exception as e:
            print(str(e), 'fetchMembers()')
            summary['error']['total'] = summary['error']['total'] + 1
            summary['error']['logs'].append(str(e))
        finally:
            return summary

    def fetchPins(self, c_id):
        channel_id = '&channel=' + c_id
        result = {}
        summary = {
            'error': {
                'total': 0,
                'logs': []
            },
            'success': 0,
            'new_pins': 0
        }
        try:
            new_pins = Pins()
            request_pins = requests.get(host + self.endpointPins + '?' + self.getToken() + channel_id)
            result = request_pins.json()
            if result.get('items'):
                new_pins.addPins(c_id, result['items'])
                summary['new_pins'] = summary['new_pins'] + len(result['items'])
            summary['success'] = summary['success'] + 1
        except Exception as e:
            print(str(e), 'fetchPins()')
            summary['error'] = summary['error'] + 1
            summary['error']['total'] = summary['error']['total'] + 1
            summary['error']['logs'].append(str(e))
        finally:
            return summary

    def fetchChannels(self, c_filter, c_type, cursor, limit):
        exclude_archived = '&exclude_archived=true'
        limit = '&limit=' + limit

        if c_filter == 'users':
            self.endpointChannelList = '/api/users.conversations'

        types = self.channelMap(c_type)

        nextCursor = '&cursor=' + cursor
        if cursor == 'first':
            nextCursor = ''

        dataChannels = []
        result = {}
        has_more = True
        channels_db = Channel()

        while has_more:
            request_channels = requests.get(host + self.endpointChannelList + '?' + self.getToken() + types + limit + nextCursor + exclude_archived)
            result = request_channels.json()
            dataChannels = dataChannels + result['channels']

            if result.get('response_metadata'):
                if result['response_metadata'].get('next_cursor'):
                    nextCursor = '&cursor=' + result['response_metadata']['next_cursor']
                    has_more = True
                else:
                    result['channels'] = dataChannels
                    has_more = False
            else:
                result['channels'] = dataChannels
                has_more = False

        for channel in dataChannels:
            channels_db.addChannel(channel)

        print('total channels:', len(dataChannels), 'listChannels() =>', c_type)

        return dataChannels

    def fetchUsers(self):
        new_users = Users()
        request_users = requests.get(host + self.endpointUsersList + '?' + self.getToken())
        result = request_users.json()
        for user in result['members']:
            new_users.addUsers(user)
            print(user['id'], 'fetchUsers()')

        return result

    def summaryCreator (self, name, new_item, req_result, summary):
        summary[name]['success'] = summary[name]['success'] + req_result['success']
        summary[name]['error']['total'] = summary[name]['error']['total'] + req_result['error']['total']
        summary[name]['error']['logs'] = summary[name]['error']['logs'] + req_result['error']['logs']
        summary[name][new_item] = summary[name][new_item] + req_result[new_item]

    def channelMap(self, c_t):
        return self.channels[c_t]

    def updateDB(self, skip, limit, options, i):
        print('start', 'updateDB()', str(i))
        result = {}
        summary = {
            'count': 0,
            'thread': i,
            'chat_result': {
                'success': 0,
                'error': {
                    'total': 0,
                    'logs': []
                },
                'new_chat': 0
            },
            'member_result': {
                'success': 0,
                'error': {
                    'total': 0,
                    'logs': []
                },
                'new_members': 0
            },
            'pin_result': {
                'success': 0,
                'error': {
                    'total': 0,
                    'logs': []
                },
                'new_pins': 0
            }
        }
        try:
            channels_db = Channel()
            channels = channels_db.getAll(skip, limit)

            if options.get('messages') or options.get('members') or options.get('pins'):
                messages = Messages()
                members = Members()

                for channel in channels:
                    if options.get('messages'):
                        message = messages.getMessageById(channel['id'])
                        cursor_message = ''
                        cursor_message_latest = '1'
                        if message:
                            if message.get('latest'):
                                cursor_message_latest = message['latest']
                        chat_result = self.fetchChats(channel['id'], cursor_message, cursor_message_latest, options['messages']['limit'])
                        self.summaryCreator('chat_result', 'new_chat', chat_result, summary)

                    if options.get('members'):
                        member = members.getMembersById(channel['id'])
                        cursor_member = ''
                        if member:
                            if member.get('last_cursor'):
                                cursor_member = member['last_cursor']
                        member_result = self.fetchMembers(channel['id'], cursor_member, options['members']['limit'])
                        self.summaryCreator('member_result', 'new_members', member_result, summary)

                    if options.get('pins'):
                        pin_result = self.fetchPins(channel['id'])
                        self.summaryCreator('pin_result', 'new_pins', pin_result, summary)

                    summary['count'] = summary['count'] + 1

                    print('(id) Channel:', channel['id'], 'Total Processed:', summary['count'], '<'+ str(summary['thread']) +'>')

        except Exception as e:
            print(str(e), 'updateDB()', str(i))
        finally:
            if options.get('messages'):
                print('chat_result:', 'new_chat =', summary['chat_result']['new_chat'], 'processed =', summary['chat_result']['success'], 'error =', summary['chat_result']['error']['total'])
                print('log errors:', summary['chat_result']['error']['logs'])
                print('===================================================================================================================')
            if options.get('members'):
                print('member_result:', 'new_members =', summary['member_result']['new_members'], 'processed =', summary['member_result']['success'], 'error =', summary['member_result']['error']['total'])
                print('log errors:', summary['member_result']['error']['logs'])
                print('===================================================================================================================')
            if options.get('pins'):
                print('pin_result:', 'new_pins =', summary['pin_result']['new_pins'], 'processed =', summary['pin_result']['success'], 'error =', summary['pin_result']['error']['total'])
                print('log errors:', summary['pin_result']['error']['logs'])
                print('===================================================================================================================')

            return summary
