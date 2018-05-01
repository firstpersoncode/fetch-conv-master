from flask import Blueprint, request, Response, session
import requests
import json
from app import app, db, host, client_id, client_secret
from app.channel_manipulation.models import Channel, Messages, Members, Users, Pins
from flask_cors import CORS
import asyncio
import aiohttp
from bson import json_util
from bson.json_util import dumps

CORS(app, supports_credentials=True)

channel_manipulation = Blueprint('manipulate', __name__, url_prefix='/miner/manipulate')


@channel_manipulation.route('/messages/<string:c_id>', methods=['GET'])
def messageManipulate(c_id):
    channel_db = Channel()
    result = channel_db.getInfo(c_id)

    return Response(
        json.dumps({
            'message': {
                'status': True,
                'result': result
            }
        }, indent=4, sort_keys=True),
        status=200,
        content_type='application/json'
    )

@channel_manipulation.route('/lists', methods=['POST'])
def listChannels():
    result = []
    op = request.json['options']
    p = request.json['project']
    s = request.json['skip']
    l = request.json['limit']

    channel_db = Channel()
    docs = dumps(channel_db.getAll(op, p, int(s), int(l)))


    return Response(
        json.dumps({
            'message': {
                'status': True,
                'result': docs
            }
        }, indent=4, sort_keys=True),
        status=200,
        content_type='application/json'
    )
