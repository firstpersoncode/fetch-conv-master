from flask import Blueprint, request, Response, session
import requests
import json
from app import app, host, client_id, client_secret
from app.channel_miner.constructor import ChannelMiner
from flask_cors import CORS
import asyncio
import aiohttp

CORS(app, supports_credentials=True)
channel_miner = Blueprint('channel', __name__, url_prefix='/miner/channels')

generated_token = ''

@channel_miner.route('/validate', methods=['POST'])
def authMinerMethod():
    global session
    global generated_token
    endpointOauth ='/api/oauth.access'
    code = request.json['code']

    try:
        request_oauth = requests.get(host + endpointOauth + '?' + client_id + '&' + client_secret + '&code=' + code)
        payload = request_oauth.json()

        generated_token = payload['access_token']
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
def checkMinerMethod():
    global generated_token
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

@channel_miner.route('/list/<string:c_filter>/<string:c_type>/<string:cursor>/<string:limit>', methods=['GET'])
def fetchChannelsMethod(c_filter, c_type, cursor, limit):
    global generated_token
    if session.get('_user_sid_'):
        try:
            channelMiner = ChannelMiner()
            channelMiner.setToken(generated_token)
            resp = channelMiner.fetchChannels(c_filter, c_type, cursor, limit)
            return Response(
                json.dumps({
                    'message': {
                        'status': True,
                        'text': 'Success fetch channels',
                        'result': resp
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

@channel_miner.route('/users', methods=['GET'])
def fetchUsersMethod():
    global generated_token
    if session.get('_user_sid_'):
        try:
            channelMiner = ChannelMiner()
            channelMiner.setToken(generated_token)
            resp = channelMiner.fetchUsers()
            return Response(
                json.dumps({
                    'message': {
                        'status': True,
                        'text': 'Success fetch users',
                        'result': resp
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


# MULTI THREADS

@channel_miner.route('/update-0', methods=['GET'])
def updateMethod0():
    global generated_token
    if session.get('_user_sid_'):
        channelMiner = ChannelMiner()
        channelMiner.setToken(generated_token)
        result = channelMiner.updateDB(0, 500, {
            'messages': {
                'limit': '500'
            },
            'members': {
                'limit': '500'
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

@channel_miner.route('/update-1', methods=['GET'])
def updateMethod1():
    global generated_token
    if session.get('_user_sid_'):
        channelMiner = ChannelMiner()
        channelMiner.setToken(generated_token)
        result = channelMiner.updateDB(500, 500, {
            'messages': {
                'limit': '500'
            },
            'members': {
                'limit': '500'
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

@channel_miner.route('/update-2', methods=['GET'])
def updateMethod2():
    global generated_token
    if session.get('_user_sid_'):
        channelMiner = ChannelMiner()
        channelMiner.setToken(generated_token)
        result = channelMiner.updateDB(1000, 500, {
            'messages': {
                'limit': '500'
            },
            'members': {
                'limit': '500'
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

@channel_miner.route('/update-3', methods=['GET'])
def updateMethod3():
    global generated_token
    if session.get('_user_sid_'):
        channelMiner = ChannelMiner()
        channelMiner.setToken(generated_token)
        result = channelMiner.updateDB(1500, 500, {
            'messages': {
                'limit': '500'
            },
            'members': {
                'limit': '500'
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
