from flask import Blueprint, request, Response, render_template, session
import requests
# from werkzeug import generate_password_hash, check_password_hash
# from flask_bcrypt import Bcrypt
import json
# Import the database object from the main app module
from app import app, host, client_id, client_secret

# from app.mod_auth.models import User

from flask_cors import CORS

CORS(app, supports_credentials=True)

# AUTHENTICATION

mod_auth = Blueprint('auth', __name__, url_prefix='/miner/auth')

generated_token = ''
token = 'token=' + generated_token


@mod_auth.route('/checkpoint', methods=['GET'])
def renderCheckPoint():
    state = request.args.get('state')
    if state == 'workspace':
        return render_template('validate_workspace.html')
    else:
        return render_template('validate_identity.html')


@mod_auth.route('/validate', methods=['POST'])
def authMethod():
    global generated_token
    global token
    global session

    # email = request.json['email']
    # password = request.json['password']
    code = request.json['code']

    # db_user = User('users')
    # db_user.addUser(email, password)


    try:
        request_oauth = requests.get(host + '/api/oauth.access?' + client_id + '&' + client_secret + '&code=' + code)
        payload = request_oauth.json()
        generated_token = payload['access_token']
        token = 'token=' + generated_token

        session['_user_sid_'] = code

        payload['client_id'] = client_id

        return Response(
            json.dumps({
                'message': {
                    'status': True,
                    'text': 'Redirecting to workspace permission ... ',
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


@mod_auth.route('/validate/check', methods=['GET'])
def authCheckMethod():
    if session.get('_user_sid_') and generated_token:
        return Response(
            json.dumps({
                'message': {
                    'status': True,
                    'text': 'isLogin'
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )

    return Response(
        json.dumps({
            'message': {
                'status': False,
                'text': 'identity Access Unauthorized'
            }
        }, indent=4, sort_keys=True),
        status=200,
        content_type='application/json'
    )




@mod_auth.route('/revoke', methods=['GET'])
def revokeMethod():
    global session
    try:
        request_revoke = requests.get(host + '/api/auth.revoke' + '?' + token)
        payload = request_revoke.json()
        session.pop('_user_sid_',None)
        session.pop('_user_scope_',None)

        return Response(
            json.dumps({
                'message': {
                    'status': True,
                    'text': 'Revoke user success'
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
                    'text': str(e) + ' Failed revoke access'
                }
            }, indent=4, sort_keys=True),
            status=200,
            content_type='application/json'
        )



@mod_auth.route('/getinfo', methods=['GET'])
def getInfo():
    if session.get('_user_sid_'):
        try:
            request_user = requests.get(host + '/api/users.identity' + '?' + token)
            user = request_user.json()

            return Response(
                json.dumps(user, indent=4, sort_keys=True),
                status=200,
                content_type='application/json'
            )

        except Exception as e:
            return Response(
                json.dumps({
                    'message': {
                        'status': False,
                        'text': str(e) + ' Failed request user info'
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
