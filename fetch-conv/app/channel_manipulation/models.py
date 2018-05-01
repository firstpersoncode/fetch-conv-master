# Import the database object (db) from the main application module
# We will define this inside /app/__init__.py in the next sections.
import pymongo
import datetime
import math
from app import db

class Channel:
    def __init__(self):
        self.collection = db['channels']
        self.data = {
            'count_by_day': [],
            'count_by_month': [],
            'count_by_year': [],
            'by_day': [],
            'by_month': [],
            'by_year': []
        }

    def setData(self, attr, data):
        self.data[attr].append(data)

    def getChannelById(self, c_id):
        return self.collection.find_one({'id': c_id})

    def getAll(self, op, project, skip, limit):
        return self.collection.find(op, project).limit(limit).skip(skip)


    def getInfo(self, c_id):
        channel_db = self.getChannelById(c_id)
        messages_db = Messages().getMessageById(c_id)
        members_db = Members().getMembersById(c_id)

        messages = messages_db['messages']

        y_2014 = 1388534400
        y_2015 = 1420070400
        y_2016 = 1451606400
        y_2017 = 1483228800
        y_2018 = 1514764800
        y_2019 = 1546300800

        y_1 = 31536000
        y_1_29 = 31622400

        d_31 = 2678400
        d_30 = 2592000
        d_29 = 2505600
        d_28 = 2419200

        d = 86400

        def split_day(messages, month, monthLocal):
            # res = []
            count = 0
            rangeDay = 31
            if monthLocal == 'feb':
                if datetime.datetime.fromtimestamp(month).strftime('%Y') == '2016':
                    rangeDay = 29
                else:
                    rangeDay = 28
            else:
                if monthLocal == 'apr' or monthLocal == 'jun' or monthLocal == 'sep' or monthLocal == 'nov':
                    rangeDay = 30
                else:
                    rangeDay = 31

            for x in range(0, rangeDay):
                counter = d
                day_splitted = [msg for msg in messages if int(float(msg['ts'])) >= (month + count) and int(float(msg['ts'])) < (month + (count + counter))]

                # res.append({
                #     # 'messages': day_splitted,
                #     'total_messages': len(day_splitted),
                #     'date': datetime.datetime.fromtimestamp(month + count).strftime('%Y-%m-%d')
                # })
                self.setData('count_by_day', {
                    # 'messages': day_splitted,
                    'total_messages': len(day_splitted),
                    'date': datetime.datetime.fromtimestamp(month + count).strftime('%Y-%m-%d')
                })
                self.setData('by_day', {
                    'messages': day_splitted,
                    'total_messages': len(day_splitted),
                    'date': datetime.datetime.fromtimestamp(month + count).strftime('%Y-%m-%d')
                })
                count = count + counter

            # return res

        def split_month(messages, year):
            # res = []
            count = 0
            for x in range(0, 12):
                monthLists = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
                monthLocal = monthLists[x]
                counter = d_31
                if monthLocal == 'feb':
                    if datetime.datetime.fromtimestamp(year).strftime('%Y') == '2016':
                        counter = d_29
                    else:
                        counter = d_28
                else:
                    if monthLocal == 'apr' or monthLocal == 'jun' or monthLocal == 'sep' or monthLocal == 'nov':
                        counter = d_30
                    else:
                        counter = d_31

                month_splitted = [msg for msg in messages if int(float(msg['ts'])) >= (year + count) and int(float(msg['ts'])) < (year + (count + counter))]

                # res.append({
                #     # 'messages': month_splitted,
                #     'total_messages': len(month_splitted),
                #     'month': monthLocal,
                #     'date': datetime.datetime.fromtimestamp(year + count).strftime('%Y-%m-%d'),
                #     'by_day': split_day(month_splitted, (year + count), monthLocal)
                # })
                split_day(month_splitted, (year + count), monthLocal)
                self.setData('count_by_month', {
                    # 'messages': month_splitted,
                    'total_messages': len(month_splitted),
                    'month': monthLocal,
                    'date': datetime.datetime.fromtimestamp(year + count).strftime('%Y-%m-%d')
                })
                self.setData('by_month', {
                    'messages': month_splitted,
                    'total_messages': len(month_splitted),
                    'month': monthLocal,
                    'date': datetime.datetime.fromtimestamp(year + count).strftime('%Y-%m-%d')
                })

                count = count + counter
            # return res

        def split_year(start, end):
            # res = []
            rangeYear = math.floor((end - start) / y_1)
            count = 0
            for x in range(0, rangeYear):
                if datetime.datetime.fromtimestamp(start + count).strftime('%Y') == '2016':
                    counter = y_1_29
                else:
                    counter = y_1

                year_splitted = [msg for msg in messages if int(float(msg['ts'])) > (start + count) and int(float(msg['ts'])) < (start + (count + counter))]

                # res.append({
                #     # 'messages': year_splitted,
                #     'total_messages': len(year_splitted),
                #     'year': datetime.datetime.fromtimestamp(start + count).strftime('%Y'),
                #     'by_month': split_month(year_splitted, (start + count))
                # })
                split_month(year_splitted, (start + count))
                self.setData('count_by_year', {
                    # 'messages': year_splitted,
                    'total_messages': len(year_splitted),
                    'year': datetime.datetime.fromtimestamp(start + count).strftime('%Y'),
                    'date': datetime.datetime.fromtimestamp(start + count).strftime('%Y-%m-%d')
                })
                self.setData('by_year', {
                    'messages': year_splitted,
                    'total_messages': len(year_splitted),
                    'year': datetime.datetime.fromtimestamp(start + count).strftime('%Y'),
                    'date': datetime.datetime.fromtimestamp(start + count).strftime('%Y-%m-%d')
                })

                count = count + counter
            # return res

        split_year(y_2014, y_2019)

        return {
            'id': c_id,
            'name': channel_db['detail']['name'],
            'messages': {
                'by_day': self.data['count_by_day'],
                'by_month': self.data['count_by_month'],
                'by_year': self.data['count_by_year']
            },
            'total_messages': len(messages),
            'total_members': len(members_db['members']),
            'ts': str(messages_db['updated'])
        }

class Messages:
    def __init__(self):
        self.collection = db['messages']

    def getMessageById(self, c_id):
        return self.collection.find_one({'id': c_id})

    def getInfo(self, messages):
        user_db = Users()

        totalJoin = 0
        totalLeave = 0
        totalFileShare = 0
        totalFileComment = 0
        totalThreadBroadCast = 0
        totalBotMessage = 0
        users = []

        for msg in messages:
            if msg.get('type') == 'message':
                if msg.get('user'):
                    if not any(user.get('id') == msg['user'] for user in users):
                        user_name = user_db.getUserById(msg['user'])['detail']['profile']['real_name']
                        users.append({
                            'id': msg['user'],
                            'name': user_name,
                            'total_messages': 1
                        })
                    else:
                        for user in users:
                            if user['id'] == msg['user']:
                                user['total_messages'] = user['total_messages'] + 1

            if msg.get('subtype'):
                if msg['subtype'] == 'channel_join':
                    totalJoin = totalJoin + 1

                if msg['subtype'] == 'channel_leave':
                    totalLeave = totalLeave + 1

                if msg['subtype'] == 'file_share':
                    totalFileShare = totalFileShare + 1

                if msg['subtype'] == 'file_comment':
                    totalFileComment = totalFileComment + 1

                if msg['subtype'] == 'thread_broadcast':
                    totalThreadBroadCast = totalThreadBroadCast + 1

                if msg['subtype'] == 'bot_message':
                    totalBotMessage = totalBotMessage + 1

        totalMembers = totalJoin - totalLeave

        return {
            'members': {
                'total': totalMembers,
                'join': totalJoin,
                'leave': totalLeave,
                'active_users': {
                    'total': len(users),
                    'users': users
                },
            },
            'files': {
                'total_share': totalFileShare,
                'total_comment': totalFileComment
            },
            'thread_broadcast': totalThreadBroadCast,
            'bot_message': totalBotMessage,
        }

class Members:
    def __init__(self):
        self.collection = db['members']

    def getMembersById(self, c_id):
        return self.collection.find_one({'id': c_id})

class Users:
    def __init__(self):
        self.collection = db['users']

    def getUserById(self, c_id):
        return self.collection.find_one({'id': c_id})


class Pins:
    def __init__(self):
        self.collection = db['pins']
