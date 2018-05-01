# Import the database object (db) from the main application module
# We will define this inside /app/__init__.py in the next sections.
import pymongo
import datetime
from app import db

class Channel:
    def __init__(self):
        self.collection = db['channels']

    def addChannel(self, data):
        self.collection.find_one_and_update({
            'id': data['id']
        }, {
          '$set': {
            'detail': data,
            'updated': datetime.datetime.utcnow()
          }
        }, upsert=True, new=True)

    def getChannelById(self, c_id):
        return self.collection.find_one({'id': c_id})

    def getAll(self, skip, limit):
        return self.collection.find({}).limit(limit).skip(skip)

class ChannelInfo:
    def __init__(self):
        self.collection = db['channels']

    def addChannel(self, data):
        self.collection.find_one_and_update({
            'id': data['id']
        }, {
          '$set': {
            'detail': data,
            'updated': datetime.datetime.utcnow()
          }
        }, upsert=True, new=True)

    def getChannelById(self, c_id):
        return self.collection.find_one({'id': c_id})

    def getAll(self, skip, limit):
        return self.collection.find({}).limit(limit).skip(skip)

class Messages:
    def __init__(self):
        self.collection = db['messages']

    def addMessages(self, c_id, data, lastCursor, latest):
        print('Messages().addMessages():', 'message length:', len(data), latest)
        data_sorted = sorted(data, key=lambda item: item['ts'])
        self.collection.find_one_and_update({
            'id': c_id
        }, {
            '$set': {
              'updated': datetime.datetime.utcnow(),
              'last_cursor': lastCursor,
              'latest': str(latest)
            },
            '$addToSet': {
                'messages': { '$each': data_sorted }
            }
        }, upsert=True, new=True)

    def getMessageById(self, c_id):
        return self.collection.find_one({'id': c_id})

class Members:
    def __init__(self):
        self.collection = db['members']

    def addMembers(self, c_id, data, lastCursor):
        print('Members().addMembers():', 'members length:', len(data))
        self.collection.find_one_and_update({
            'id': c_id
        }, {
            '$set': {
              'updated': datetime.datetime.utcnow(),
              'last_cursor': lastCursor
            },
            '$addToSet': {
                'members': { '$each': data }
            }
        }, upsert=True, new=True)

    def getMembersById(self, c_id):
        return self.collection.find_one({'id': c_id})

class Users:
    def __init__(self):
        self.collection = db['users']

    def addUsers(self, data):
        self.collection.find_one_and_update({
            'id': data['id']
        }, {
          '$set': {
            'detail': data,
            'updated': datetime.datetime.utcnow()
          }
        }, upsert=True, new=True)


class Pins:
    def __init__(self):
        self.collection = db['pins']

    def addPins(self, c_id, data):
        print('Pins().addPins():', 'pins length:', len(data))
        self.collection.find_one_and_update({
            'id': c_id
        }, {
            '$set': {
              'updated': datetime.datetime.utcnow()
            },
            '$addToSet': {
                'pins': { '$each': data }
            }
        }, upsert=True, new=True)
