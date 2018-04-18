from flask import Blueprint, request, Response, session
import requests
import json
from app import app, db, host, client_id, client_secret
from app.channel_miner.models import Channel, Messages, Members, Users, Pins
from flask_cors import CORS
import asyncio
import aiohttp


CORS(app, supports_credentials=True)

channel_miner = Blueprint('channel', __name__, url_prefix='/miner/channels')

generated_token = ''
token = 'token=' + generated_token

endpointOauth ='/api/oauth.access'
endpointChat = '/api/conversations.history'
endpointMembersList = '/api/conversations.members'
endpointPins = '/api/pins.list'
endpointUsersList = '/api/users.list'

def channelMap(c_t):
    return {
        'private': '&types=private_channel',
        'public': '&types=public_channel',
        'im': '&types=im',
        'mpim': '&types=mpim'
    }[c_t]

@channel_miner.route('/validate', methods=['POST'])
def authMinerMethod():
    code = request.json['code']

    global generated_token
    global token
    global session

    try:
        request_oauth = requests.get(host + endpointOauth + '?' + client_id + '&' + client_secret + '&code=' + code)
        payload = request_oauth.json()
        generated_token = payload['access_token']
        token = 'token=' + generated_token

        session['_user_scope_'] = code

        return Response(
            json.dumps({
                'message': {
                    'status': True,
                    'text': 'Redirecting back to fetch-conv panel ...',
                    'payload': payload
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )

    except Exception as e:
        return Response(
            json.dumps({
                'message': {
                    'status': False,
                    'text': str(e) + ' Failed request access'
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )

@channel_miner.route('/validate/check', methods=['GET'])
def minerCheckMethod():
    if session.get('_user_scope_') and generated_token:
        return Response(
            json.dumps({
                'message': {
                    'status': True,
                    'text': 'scope'
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )

    return Response(
        json.dumps({
            'message': {
                'status': False,
                'text': 'scope Access Unauthorized'
            }
        }, indent=4, sort_keys=True),
        status=200,
        content_type='application/json'
    )

# @channel_miner.route('/messages/<string:c_id>/<string:cursor>/<string:oldest>/<string:limit>', methods=['GET'])
def fetchChats(c_id, cursor, latest, limit):
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
            request_chats = requests.get(host + endpointChat + '?' + token + channel_id + limit + oldestCursor + nextCursor)
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

# @channel_miner.route('/members/<string:c_id>/<string:cursor>/<string:limit>', methods=['GET'])
def fetchMembers(c_id, cursor, limit):
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
            request_members = requests.get(host + endpointMembersList + '?' + token + channel_id + limit + nextCursor)
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

# @channel_miner.route('/pins/<string:c_id>', methods=['GET'])
def fetchPins(c_id):
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
        request_pins = requests.get(host + endpointPins + '?' + token + channel_id)
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

@channel_miner.route('/users', methods=['GET'])
def fetchUsers():
    if session.get('_user_sid_'):
        try:
            new_users = Users()
            request_users = requests.get(host + endpointUsersList + '?' + token)
            result = request_users.json()
            for user in result['members']:
                new_users.addUsers(user)
                print(user['id'], 'fetchUsers()')
            return Response(
                json.dumps({
                    'message': {
                        'status': True,
                        'text': 'Success fetch users',
                        'result': result
                    }
                }, indent=4, sort_keys=True),
                status=200,
                content_type='application/json'
            )
        except Exception as e:
            print(str(e), 'fetchUsers()')
            return Response(
                json.dumps({
                    'message': {
                        'status': False,
                        'text': 'Error: ' + str(e)
                    }
                }, indent=4, sort_keys=True),
                status=200,
                content_type='application/json'
            )
    else:
        print('Unauthorized', 'fetchUsers()')
        return Response(
            json.dumps({
                'message': {
                    'status': False,
                    'text': 'Unauthorized Access'
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )

@channel_miner.route('/info/<string:channel_type>/<string:c_id>', methods=['GET'])
def fetchChannelInfo(channel_type, c_id):
    if session.get('_user_sid_'):
        enpointChannelList = '/api/channels'
        channel_id = '&channel=' + c_id

        if channel_type == 'private':
            enpointChannelList = '/api/groups'

        try:
            request_info = requests.get(host + enpointChannelList + '.info' + '?' + token + channel_id + '&include_locale=true')
            result = request_info.json()
            print(result['id'], 'fetchChannelInfo()')
            return Response(
                json.dumps(result, indent=4, sort_keys=True),
                status=200,
                content_type='application/json'
            )
        except Exception as e:
            print(str(e), 'fetchChannelInfo()')
            return Response(
                json.dumps({
                    'message': {
                        'status': False,
                        'text': str(e) + ' Failed request channel info'
                    }
                }, indent=4, sort_keys=True),
                status=200,
                content_type='application/json'
            )
    else:
        print('Unauthorized', 'fetchChannelInfo()')
        return Response(
            json.dumps({
                'message': {
                    'status': False,
                    'text': 'Unauthorized Access'
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )

@channel_miner.route('/list/<string:c_filter>/<string:c_type>/<string:cursor>/<string:limit>', methods=['GET'])
def fetchChannels(c_filter, c_type, cursor, limit):

    if session.get('_user_sid_'):
        exclude_archived = '&exclude_archived=true'
        limit = '&limit=' + limit

        enpointChannelList = '/api/conversations.list'
        if c_filter == 'users':
            enpointChannelList = '/api/users.conversations'

        types = channelMap(c_type)

        nextCursor = '&cursor=' + cursor
        if cursor == 'first':
            nextCursor = ''

        try:
            dataChannels = []
            result = {}
            has_more = True
            channels_db = Channel()

            while has_more:
                request_channels = requests.get(host + enpointChannelList + '?' + token + types + limit + nextCursor + exclude_archived)
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
            return Response(
                json.dumps({
                    'message': {
                        'status': True,
                        'text': 'Success fetch channels',
                        'result': dataChannels
                    }
                }, indent=4, sort_keys=True),
                status=200,
                content_type='application/json'
            )

        except Exception as e:
            print(str(e), 'listChannels()')
            return Response(
                json.dumps({
                    'message': {
                        'status': False,
                        'text': 'Error: ' + str(e)
                    }
                }, indent=4, sort_keys=True),
                status=200,
                content_type='application/json'
            )
    else:
        print('Unauthorized', 'listChannels()')
        return Response(
            json.dumps({
                'message': {
                    'status': False,
                    'text': 'Unauthorized Access'
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )

def updateDB(skip, limit, options, i):
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

    def summaryCreator (name, new_item, req_result):
        summary[name]['success'] = summary[name]['success'] + req_result['success']
        summary[name]['error']['total'] = summary[name]['error']['total'] + req_result['error']['total']
        summary[name]['error']['logs'] = summary[name]['error']['logs'] + req_result['error']['logs']
        summary[name][new_item] = summary[name][new_item] + req_result[new_item]

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
                    chat_result = fetchChats(channel['id'], cursor_message, cursor_message_latest, options['messages']['limit'])
                    summaryCreator('chat_result', 'new_chat', chat_result)

                if options.get('members'):
                    member = members.getMembersById(channel['id'])
                    cursor_member = ''
                    if member:
                        if member.get('last_cursor'):
                            cursor_member = member['last_cursor']
                    member_result = fetchMembers(channel['id'], cursor_member, options['members']['limit'])
                    summaryCreator('member_result', 'new_members', member_result)

                if options.get('pins'):
                    pin_result = fetchPins(channel['id'])
                    summaryCreator('pin_result', 'new_pins', pin_result)

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


# MULTI THREADS

@channel_miner.route('/update-0', methods=['GET'])
def updateMethod0():
    # if session.get('_user_sid_'):
        result = updateDB(0, 500, {
            'messages': {
                'limit': '800'
            },
            'members': {
                'limit': '800'
            },
            'pins': True
        }, 0)

        return Response(
            json.dumps({
                'message': {
                    'status': True,
                    'text': 'done',
                    'result': result
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )
    # else:
    #     return Response(
    #         json.dumps({
    #             'message': {
    #                 'status': False,
    #                 'text': 'Unauthorized Access'
    #             }
    #         }, indent=4, sort_keys=True),
    #         status=200,
    #         content_type='application/json'
    #     )

@channel_miner.route('/update-1', methods=['GET'])
def updateMethod1():
    # if session.get('_user_sid_'):
        result = updateDB(500, 500, {
            'messages': {
                'limit': '800'
            },
            'members': {
                'limit': '800'
            },
            'pins': True
        }, 1)

        return Response(
            json.dumps({
                'message': {
                    'status': True,
                    'text': 'done',
                    'result': result
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )
    # else:
    #     return Response(
    #         json.dumps({
    #             'message': {
    #                 'status': False,
    #                 'text': 'Unauthorized Access'
    #             }
    #         }, indent=4, sort_keys=True),
    #         status=200,
    #         content_type='application/json'
    #     )

@channel_miner.route('/update-2', methods=['GET'])
def updateMethod2():
    # if session.get('_user_sid_'):
        result = updateDB(1000, 500, {
            'messages': {
                'limit': '800'
            },
            'members': {
                'limit': '800'
            },
            'pins': True
        }, 2)

        return Response(
            json.dumps({
                'message': {
                    'status': True,
                    'text': 'done',
                    'result': result
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )
    # else:
    #     return Response(
    #         json.dumps({
    #             'message': {
    #                 'status': False,
    #                 'text': 'Unauthorized Access'
    #             }
    #         }, indent=4, sort_keys=True),
    #         status=200,
    #         content_type='application/json'
    #     )

@channel_miner.route('/update-3', methods=['GET'])
def updateMethod3():
    # if session.get('_user_sid_'):
        result = updateDB(1500, 500, {
            'messages': {
                'limit': '800'
            },
            'members': {
                'limit': '800'
            },
            'pins': True
        }, 3)

        return Response(
            json.dumps({
                'message': {
                    'status': True,
                    'text': 'done',
                    'result': result
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )
    # else:
    #     return Response(
    #         json.dumps({
    #             'message': {
    #                 'status': False,
    #                 'text': 'Unauthorized Access'
    #             }
    #         }, indent=4, sort_keys=True),
    #         status=200,
    #         content_type='application/json'
    #     )
