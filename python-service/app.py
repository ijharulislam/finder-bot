from flask import Flask, request, jsonify
from chatterbot.trainers import ListTrainer
import json

app = Flask(__name__)

from chatterbot import ChatBot
chatbot = ChatBot("Finder", trainer='chatterbot.trainers.ChatterBotCorpusTrainer')
# chatbot.train('chatterbot.corpus.english')
# Train based on english greetings corpus
chatbot.train("chatterbot.corpus.english.greetings")

# Train based on the english conversations corpus
chatbot.train("chatterbot.corpus.english.conversations")

@app.route('/')
def hello():
    return "Finder Chatbot"


@app.route('/chat_response', methods=['GET'])
def chat_response():
	message = request.args.get('message')
	response = chatbot.get_response(message)
	return jsonify({"response":response.text}), 200


@app.route('/train_bot', methods=['POST'])
def train_bot():
	if not request.json:
		abort(400)
	data = request.get_json()
	conversation = data["conversation"]
	conversation = [
		"hi",
		"Hi there",
		"hello", 
		"anybody there",
		"Assalamu Alaikum",
	]

	chatbot.set_trainer(ListTrainer)
	chatbot.train(conversation)
	return jsonify({'success': True}), 201

if __name__ == '__main__':
	app.run()