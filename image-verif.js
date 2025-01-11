const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const natural = require('natural');

let model;

async function loadModel() {
  model = await mobilenet.load();
  console.log('MobileNet model loaded');
}

loadModel();

async function verifyImage(imageBuffer, description) {
  if (!model) {
    await loadModel();
  }

  const image = tf.node.decodeImage(imageBuffer);
  const predictions = await model.classify(image);

  const tokenizer = new natural.WordTokenizer();
  const descriptionTokens = tokenizer.tokenize(description.toLowerCase());

  let maxConfidence = 0;

  for (const prediction of predictions) {
    const classTokens = tokenizer.tokenize(prediction.className.toLowerCase());
    const intersection = descriptionTokens.filter(token => classTokens.includes(token));
    const confidence = intersection.length / descriptionTokens.length;
    maxConfidence = Math.max(maxConfidence, confidence);
  }

  return maxConfidence;
}

module.exports = { verifyImage };

