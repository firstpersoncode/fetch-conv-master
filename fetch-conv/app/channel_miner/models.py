# Import the database object (db) from the main application module
# We will define this inside /app/__init__.py in the next sections.
import pymongo
import datetime
from app import db

class Channel:
    def __init__(self, collection):
        self.collection = db[collection]
        # self.unique = self.collection.create_index([('id', pymongo.ASCENDING)], unique=True)
        # self.uniqueC = self.collection.create_index([('ch', pymongo.ASCENDING)], unique=True)
        # sorted(list(self.collection.index_information()))

    def addChannel(self, data):
        self.collection.find_one_and_update({
            'id': data['id']
        }, {
          '$set': {
            'detail': data,
            'updated': datetime.datetime.utcnow()
          }
        }, upsert=True, new=True)

    def addMembers(self, c_id, data):
        self.collection.find_one_and_update({
            'id': c_id
        }, {
          '$set': {
            'updated': datetime.datetime.utcnow()
          },
          '$addToSet': {
            'detail.members': { '$each': data },
          }
        }, upsert=True, new=True)

    def addUsers(self, data):
        self.collection.find_one_and_update({
            'id': data['id']
        }, {
          '$set': {
            'detail': data,
            'updated': datetime.datetime.utcnow()
          }
        }, upsert=True, new=True)

    def addMessages(self, c_id, data, lastCursor):
        self.collection.find_one_and_update({
            'id': c_id
        }, {
            '$set': {
              'updated': datetime.datetime.utcnow(),
              'last_cursor': lastCursor
            },
            '$addToSet': {
                'messages': { '$each': data }
            }
        }, upsert=True, new=True)

    def addPins(self, c_id, data):
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

    def getChannelById(self, c_id):
        return self.collection.find_one({'id': c_id})

    def getMessageById(self, c_id):
        return self.collection.find_one({'id': c_id})

    def getChannels(self):
        return self.collection.find_one({})
