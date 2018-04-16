from flask import Blueprint, request, Response, session
import requests
import json
from app import app, db, host, client_id, client_secret
from app.channel_miner.models import Channel
from flask_cors import CORS


CORS(app, supports_credentials=True)

channel_miner = Blueprint('channel', __name__, url_prefix='/miner/channels')

generated_token = ''
token = 'token=' + generated_token


@channel_miner.route('/validate', methods=['POST'])
def authMinerMethod():
    code = request.json['code']

    global generated_token
    global token
    global session

    try:
        request_oauth = requests.get(host + '/api/oauth.access?' + client_id + '&' + client_secret + '&code=' + code)
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

# @channel_miner.route('/messages/<string:c_id>/<string:cursor>/<string:limit>', methods=['GET'])
def openChat(c_id, cursor, limit):
    if session.get('_user_sid_'):
        enpointChannelList = '/api/conversations.history'
        channel_id = '&channel=' + c_id

        nextCursor = ''
        limit = '&limit=' + limit

        if cursor != 'end':
            nextCursor = '&cursor=' + cursor
            if cursor == 'first':
                nextCursor = ''

            try:
                dataMessage = []
                result = {}
                has_more = True
                new_messages = Channel('messages')

                while has_more:
                    request_chats = requests.get(host + enpointChannelList + '?' + token + channel_id + limit + nextCursor)
                    result = request_chats.json()
                    dataMessage = dataMessage + result['messages']
                    print(result['has_more'], nextCursor, 'openChat()')
                    if result['has_more']:
                        nextCursor = '&cursor=' + result['response_metadata']['next_cursor']
                        has_more = True
                    else:
                        result['messages'] = dataMessage
                        has_more = False

                new_messages.addMessages(c_id, dataMessage)

                # return Response(
                #     json.dumps({
                #         'message': {
                #             'status': True,
                #             'text': 'Success fetch messages'
                #         },
                #         'messages': result['messages']
                #     }, indent=4, sort_keys=True),
                #     status=200,
                #     content_type='application/json'
                # )


            except Exception as e:
                # return Response(
                #     json.dumps({
                #         'message': {
                #             'status': False,
                #             'text': str(e) + ' Failed request channel info'
                #         }
                #     }, indent=4, sort_keys=True),
                #     status=200,
                #     content_type='application/json'
                # )
                print(str(e), 'openChat()')
        else:
            # return Response(
            #     json.dumps({
            #         'ok': True,
            #         'messages': [],
            #         'message': {
            #             'status': True,
            #             'text': 'end of cursor',
            #             'end': True
            #         },
            #         'response_metadata': {'next_cursor': ''}
            #     }, indent=4, sort_keys=True),
            #     status=200,
            #     content_type='application/json'
            # )
            print('end', 'openChat()')
    else:
        # return Response(
        #     json.dumps({
        #         'message': {
        #             'status': False,
        #             'text': 'Unauthorized Access'
        #         }
        #     }, indent=4, sort_keys=True),
        #     status=200,
        #     content_type='application/json'
        # )
        print('Unauthorized', 'openChat()')

@channel_miner.route('/members/<string:c_id>/<string:cursor>/<string:limit>', methods=['GET'])
def openMember(c_id, cursor, limit):
    if session.get('_user_sid_'):
        enpointChannelList = '/api/conversations.members'
        channel_id = '&channel=' + c_id

        nextCursor = ''
        limit = '&limit=' + limit

        if cursor != 'end':
            nextCursor = '&cursor=' + cursor
            if cursor == 'first':
                nextCursor = ''

            try:
                dataMembers = []
                result = {}
                has_more = True

                while has_more:
                    request_members = requests.get(host + enpointChannelList + '?' + token + channel_id + limit + nextCursor)
                    result = request_members.json()
                    dataMembers = dataMembers + result['members']
                    if result['has_more']:
                        nextCursor = '&cursor=' + result['response_metadata']['next_cursor']
                        has_more = True
                    else:
                        result['members'] = dataMembers
                        has_more = False

                return Response(
                    json.dumps(result, indent=4, sort_keys=True),
                    status=200,
                    content_type='application/json'
                )
            except Exception as e:
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
            return Response(
                json.dumps({
                    'ok': True,
                    'members': [],
                    'message': {
                        'status': True,
                        'text': 'end of cursor',
                        'end': True
                    },
                    'response_metadata': {'next_cursor': ''}
                }, indent=4, sort_keys=True),
                status=200,
                content_type='application/json'
            )
    else:
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

# @channel_miner.route('/pins/<string:c_id>', methods=['GET'])
def openPin(c_id):
    if session.get('_user_sid_'):
        enpointChannelList = '/api/pins.list'
        channel_id = '&channel=' + c_id

        try:
            new_pins = Channel('pins')
            request_pins = requests.get(host + enpointChannelList + '?' + token + channel_id)
            result = request_pins.json()
            new_pins.addPins(c_id, result['items'])
            print('stored to db', 'openPin()')
            # return Response(
            #     json.dumps(result, indent=4, sort_keys=True),
            #     status=200,
            #     content_type='application/json'
            # )
        except Exception as e:
            # return Response(
            #     json.dumps({
            #         'message': {
            #             'status': False,
            #             'text': str(e) + ' Failed request channel info'
            #         }
            #     }, indent=4, sort_keys=True),
            #     status=200,
            #     content_type='application/json'
            # )
            print(str(e), 'openPin()')
    else:
        # return Response(
        #     json.dumps({
        #         'message': {
        #             'status': False,
        #             'text': 'Unauthorized Access'
        #         }
        #     }, indent=4, sort_keys=True),
        #     status=200,
        #     content_type='application/json'
        # )
        print('Unauthorized', 'openPin()')

# @channel_miner.route('/info/<string:channel_type>/<string:c_id>', methods=['GET'])
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
            # return Response(
            #     json.dumps(result, indent=4, sort_keys=True),
            #     status=200,
            #     content_type='application/json'
            # )
        except Exception as e:
            # return Response(
            #     json.dumps({
            #         'message': {
            #             'status': False,
            #             'text': str(e) + ' Failed request channel info'
            #         }
            #     }, indent=4, sort_keys=True),
            #     status=200,
            #     content_type='application/json'
            # )
            print(str(e), 'fetchChannelInfo()')
    else:
        # return Response(
        #     json.dumps({
        #         'message': {
        #             'status': False,
        #             'text': 'Unauthorized Access'
        #         }
        #     }, indent=4, sort_keys=True),
        #     status=200,
        #     content_type='application/json'
        # )
        print('Unauthorized', 'fetchChannelInfo()')

@channel_miner.route('/list/<string:c_filter>/<string:c_type>/<string:cursor>/<string:limit>', methods=['GET'])
def listChannels(c_filter, c_type, cursor, limit):

    if session.get('_user_sid_'):
        enpointChannelList = '/api/conversations.list'
        nextCursor = ''
        exclude_archived = '&exclude_archived=true'
        limit = '&limit=' + limit

        if c_filter == 'users':
            enpointChannelList = '/api/users.conversations'

        def channelMap(c_t):
            return {
                'private': '&types=private_channel',
                'public': '&types=public_channel',
                'im': '&types=im',
                'mpim': '&types=mpim'
            }[c_t]

        types = channelMap(c_type)

        if cursor != 'end':
            nextCursor = '&cursor=' + cursor
            if cursor == 'first':
                nextCursor = ''

            try:
                dataChannels = []
                result = {}
                has_more = True
                new_channel = Channel('channels')

                while has_more:
                    request_channels = requests.get(host + enpointChannelList + '?' + token + types + limit + nextCursor + exclude_archived)
                    result = request_channels.json()
                    dataChannels = dataChannels + result['channels']
                    print('total channels:', len(dataChannels), 'listChannels() =>', c_type)

                    if result['response_metadata']['next_cursor']:
                        nextCursor = '&cursor=' + result['response_metadata']['next_cursor']
                        has_more = True
                    else:
                        result['channels'] = dataChannels
                        has_more = False

                for channel in dataChannels:
                    new_channel.addChannel(channel)
                    openChat(channel['id'], 'first', '1000')
                    openPin(channel['id'])


                return Response(
                    json.dumps({
                        'message': {
                            'status': True,
                            'text': 'Success fetch channels'
                        },
                        'channels': result['channels']
                    }, indent=4, sort_keys=True),
                    status=200,
                    content_type='application/json'
                )

            except Exception as e:
                return Response(
                    json.dumps({
                        'message': {
                            'status': False,
                            'text': str(e) + ' Failed request channel'
                        }
                    }, indent=4, sort_keys=True),
                    status=200,
                    content_type='application/json'
                )
        else:
            return Response(
                json.dumps({
                    'ok': True,
                    'channels': [],
                    'message': {
                        'status': True,
                        'text': 'end of cursor',
                        'end': True
                    },
                    'response_metadata': {'next_cursor': ''}
                }, indent=4, sort_keys=True),
                status=200,
                content_type='application/json'
            )
    else:
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
