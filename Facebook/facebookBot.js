//libraries
const express = require("express");
const router = express.Router();
const request = require("request");
const uuid = require("uuid");
const axios = require("axios");
//files
const config = require("../config");
const dialogflow = require("../dialogflow");
const { structProtoToJson } = require("./helpers/structFunctions");
//mongodb models
const ChatbotUser = require("../Models/ChatbotUsers");
const Product = require("../Models/Products");


// Messenger API parameters
if (!config.FB_PAGE_TOKEN) {
  throw new Error("missing FB_PAGE_TOKEN");
}
if (!config.FB_VERIFY_TOKEN) {
  throw new Error("missing FB_VERIFY_TOKEN");
}
if (!config.GOOGLE_PROJECT_ID) {
  throw new Error("missing GOOGLE_PROJECT_ID");
}
if (!config.DF_LANGUAGE_CODE) {
  throw new Error("missing DF_LANGUAGE_CODE");
}
if (!config.GOOGLE_CLIENT_EMAIL) {
  throw new Error("missing GOOGLE_CLIENT_EMAIL");
}
if (!config.GOOGLE_PRIVATE_KEY) {
  throw new Error("missing GOOGLE_PRIVATE_KEY");
}
if (!config.FB_APP_SECRET) {
  throw new Error("missing FB_APP_SECRET");
}

const sessionIds = new Map();

// for Facebook verification
router.get("/webhook/", function (req, res) {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === config.FB_VERIFY_TOKEN
  ) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

//for webhook facebook
router.post("/webhook/", function (req, res) {
  var data = req.body;
  // Make sure this is a page subscription
  if (data.object == "page") {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function (pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function (messagingEvent) {
        if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.log(
            "Webhook received unknown messagingEvent: ",
            messagingEvent
          );
        }
      });
    });

    // Assume all went well.
    // You must send back a 200, within 20 seconds
    res.sendStatus(200);
  }
});

async function receivedMessage(event) {
  var senderId = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  console.log(
    "Received message for user %d and page %d at %d with message:",
    senderId,
    recipientID,
    timeOfMessage
  );

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    handleEcho(messageId, appId, metadata);
    return;
  } else if (quickReply) {
    handleQuickReply(senderId, quickReply, messageId);
    return;
  }
  saveUserData(senderId);

  if (messageText) {
    //send message to dialogflow
    console.log("MENSAJE DEL USUARIO: ", messageText);
    await sendToDialogFlow(senderId, messageText);
  } else if (messageAttachments) {
    handleMessageAttachments(messageAttachments, senderId);
  }
}

async function saveUserData(facebookId) {
  let userData = await getUserData(facebookId);
  let chatbotUser = new ChatbotUser({
    firstName: userData.first_name,
    lastName: userData.last_name,
    facebookId,
    profilePic: userData.profile_pic,
  });
  chatbotUser.save((err, res) => {
    if (err) return console.log(err);
    console.log("se creo un usuario:", res);
  });
}

function handleMessageAttachments(messageAttachments, senderId) {
  //for now just reply
  sendTextMessage(senderId, "Archivo adjunto recibido... gracias! .");
}

async function setSessionAndUser(senderId) {
  try {
    if (!sessionIds.has(senderId)) {
      sessionIds.set(senderId, uuid.v1());
    }
  } catch (error) {
    throw error;
  }
}

async function handleQuickReply(senderId, quickReply, messageId) {
  let quickReplyPayload = quickReply.payload;
  console.log(
    "Quick reply for message %s with payload %s",
    messageId,
    quickReplyPayload
  );
  this.elements = a;
  // send payload to api.ai
  sendToDialogFlow(senderId, quickReplyPayload);
}

async function handleDialogFlowAction(
  sender,
  action,
  messages,
  contexts,
  parameters
) {
  switch (action) {
    case "Ubicacion.action":
      sendTextMessage(sender, "Es el Instituto de Ingenieros Eléctricos y Electrónicos");
      sendImageMessage(sender, "https://blog.telecom.pucp.edu.pe/wp-content/uploads/2016/09/cde-fotochopeado.jpg");
      handleMessages(messages, sender);
      break;
    case "Respuesta68.action":
      sendImageMessage(sender, "https://ctnaval.com/wp-content/uploads/2019/07/Post-IEC.jpg");
      handleMessages(messages, sender);
      break;
    case "Respuesta69.action":
      sendImageMessage(sender, "https://telesaludblog.files.wordpress.com/2016/04/ansi.jpg");
      handleMessages(messages, sender);
      break;
    case "Respuesta34.action":
      sendImageMessage(sender, "https://www.monografias.com/docs113/introduccion-redes-inalambricas-ppt/Diapositiva16.png");
      sendTextMessage(sender, "IEEE Standard for Information Technology, 2021, P.307");
      handleMessages(messages, sender);
      break;
    case "Respuesta83.action":
      sendImageMessage(sender, "https://www.monografias.com/docs113/introduccion-redes-inalambricas-ppt/Diapositiva16.png");
      handleMessages(messages, sender);
      break;
    case "Respuesta84.action":
      sendImageMessage(sender, "https://www.monografias.com/docs113/introduccion-redes-inalambricas-ppt/Diapositiva16.png");
      handleMessages(messages, sender);
      break;
    case "Respuesta35.action":
      sendImageMessage(sender, "https://www.monografias.com/docs113/introduccion-redes-inalambricas-ppt/Diapositiva16.png");
      handleMessages(messages, sender);
      break;
    case "Respuesta85.action":
      sendImageMessage(sender, "https://www.monografias.com/docs113/introduccion-redes-inalambricas-ppt/Diapositiva16.png");
      handleMessages(messages, sender);
      break;
    case "Respuesta36.action":
      sendImageMessage(sender, "https://www.monografias.com/docs113/introduccion-redes-inalambricas-ppt/Diapositiva16.png");
      handleMessages(messages, sender);
      break;
    case "Respuesta54.action":
      sendImageMessage(sender, "https://www.researchgate.net/profile/Ayman-Wazwaz/publication/255651852/figure/fig7/AS:347236123856903@1459798951622/5-Using-SIFS-and-DIFS-example-3.png");
      handleMessages(messages, sender);
      break;
    case "Respuesta92.action":
      sendImageMessage(sender, "https://www.researchgate.net/profile/Ayman-Wazwaz/publication/255651852/figure/fig7/AS:347236123856903@1459798951622/5-Using-SIFS-and-DIFS-example-3.png");
      handleMessages(messages, sender);
      break;
    case "Respuesta101.action":
      sendImageMessage(sender, "https://mrncciew.files.wordpress.com/2014/10/cwap-ppdu-01.png");
      handleMessages(messages, sender);
      break;
    case "Respuesta16.action":
      sendImageMessage(sender, "https://mrncciew.files.wordpress.com/2014/10/cwap-ppdu-01.png");
      handleMessages(messages, sender);
      break;
    case "Respuesta113.action":
      sendImageMessage(sender, "https://www.academiatesto.com.ar/cms/sites/default/files/333_62.jpg");
      handleMessages(messages, sender);
      break;
    case "Respuesta114.action":
      sendImageMessage(sender, "https://www.profesionalreview.com/wp-content/uploads/2017/11/como-funciona-wifi.jpg");
      handleMessages(messages, sender);
      break;
    case "Respuesta105.action":
      sendImageMessage(sender, "https://www.researchgate.net/profile/P-Duhamel/publication/4373030/figure/fig5/AS:668667813568513@1536434238140/Format-of-the-80211-DSSS-PHY-packet-At-PHY-layer-the-80211-standard-provides-1-or-2.png");
      handleMessages(messages, sender);
      break;
    case "Respuesta103.action":
      sendImageMessage(sender, "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/SSID_ESS.svg/1200px-SSID_ESS.svg.png");
      handleMessages(messages, sender);
      break;
    case "Redes.info.action":
      let redName = parameters.fields.redName.stringValue;
      let redInfo = await Product.findOne({ name: redName });
      sendGenericMessage(sender, [
        {
          title: redInfo.name + " &" + redInfo.description,
          image_url: redInfo.img,
          subtitle: redInfo.description,
          buttons:[
            {
              type: "postback",
              title: "Bae, A. S. Alfa, 2022, p.978",
              payload: "Y. H. Bae, A. S. Alfa and B. D. Choi, Performance Analysis of Modified IEEE 802.11-Based Cognitive Radio Networks in IEEE Communications Letters, pp. 975-977, October 2022",
            },{
              type: "postback",
              title: "Yin, Y. Gao, S. Manzoor, 2022, p.1620",
              payload: "Y. Yin, Y. Gao, S. Manzoor and X. Hei Optimal RTS Threshold for IEEE 802.11 WLANs: Basic or RTS/CTS 2022 IEEE SmartWorld, Ubiquitous Intelligence & Computing, Advanced & Trusted Computing, Scalable Computing & Communications, Leicester, UK, 2022, pp. 1620-1625",
            },             
          ],      
        },
      ]);
      break;
    case "Code.DemasElementos.action":
      await sendTextMessage(sender, "La Organización Internacional de Normalización conocida por el acrónimo ISO es una organización para la creación de estándares internacionales compuesta por diversas organizaciones nacionales de normalización");
      await sendImageMessage(sender, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTROKed2N9dTwPOA8cZEII2LBmjHmz1IVeIztZdnI-PHU_xUBa0jm3oB0ADolO7gXbEU0A&usqp=CAU");
      await sendButtonMessage(sender, "ESTANDAR ISO 802-11", [{
        type: "web_url",
        url: "https://ieeexplore.ieee.org/document/9363693",
        title: "Visita ISO 802-11",
      },
    ]);
      break;
    case "Estandar.action":
      await sendTextMessage(sender, "El estandar 802.11 opera en la banda de frecuencia de 5 GHz y proporciona velocidades de hasta 54 Mb/s posee un área de cobertura menor y es menos efectivo al penetrar estructuras edilicias.A. M. Shabalin IEEE Standard for Information Technology, 2022, P.03. Con URL: https://jwcn-eurasipjournals.springeropen.com/articles/10.1155/2010/315381");
      await sendImageMessage(sender, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWOiJydU71VVVXtMpzQZE3RHAjfa1wbPU_ESpgj2riBC1yfaOkwNLEiEWtWljjD26lSYI&usqp=CAU");
      await sendButtonMessage(sender, "ESTANDAR 802-11", [{
        type: "web_url",
        url: "https://www.youtube.com/watch?v=HGRnn9IUObg",
        title: "Visita El VIDEO",
      },
    ]);
      break;
    case "Code.menuCarrusel.action":
      let inalambricos=[
        {
          id:1,
          nombre:"WLAN",
          img:"https://www.redesinalambricas.es/wp-content/uploads/2019/03/wireless-lan.jpg",
          descripcion:"WLAN es la abreviatura de Wireless Local Area Network y se refiere a una red de computadoras a distancia de unas pocas decenas o cientos de metros, que utiliza señales de radio de alta frecuencia para transmitir y recibir datos",
          precio:0,
        },{
          id:2,
          nombre:"WPA2",
          img:"https://t3.ftcdn.net/jpg/00/74/99/52/360_F_74995234_m6HDrhakCAIttyFGAZJFUNNEOxQanVJQ.jpg",
          descripcion:"El WPA2 es para poder proteger sus datos y todos los dispositivos de su red, es necesario disponer de un protocolo de seguridad adecuado para su router y WPA2 se ha convertido en el estándar por excelencia su diferencia en relación con otros protocolos y la manera de optimizarlo para lograr un mayor cifrado en sus comunicaciones en línea",
          precio:0,
        },{
          id:3,
          nombre:"WPA3",
          img:"https://c8.alamy.com/compes/2ct48r6/nuevo-protocolo-de-seguridad-de-red-wpa3-2ct48r6.jpg",
          descripcion:"La seguridad WPA3 está diseñada para ayudar a prevenir eso. En lugar de confiar en contraseñas compartidas WPA3 registra nuevos dispositivos a través de procesos que no requieren el uso de una contraseña compartida la encriptación WPA3 está orientada a ser mejor que las iteraciones anteriores de la tecnología WiFi En primer lugar, al igual que el paso de los navegadores Google Chrome y Firefox para advertir o bloquear directamente la conexión de los usuarios a servidores web inseguros",
          precio:0,
        },
      ];
      let tarjetas = [];
      inalambricos.forEach(inalambrico => {
        tarjetas.push({
          title: inalambrico.nombre+" $"+inalambrico.precio,
          image_url: inalambrico.img,
          subtitle: inalambrico.descripcion,
          buttons:[
            {
              type: "postback",
              title: "Bae, A. S. Alfa, 2022, p.978",
              payload: "Especificado MAC Y PHY",
            },{
              type: "postback",
              title: "Yin, Y. Gao, S. Manzoor, 2022, p.1620",
              payload: "Especificado MAC Y PHY",
            },             
          ],      
        });
      });
      sendGenericMessage(sender, tarjetas);

      break;
    case "Codigo.quickReply.action":
      let replies = [];
      for (let i = 1; i <= 5; i++) {
        replies.push({
          payload: "si_acepto",
          image_url: "https://w7.pngwing.com/pngs/989/701/png-transparent-wi-fi-tonge-barn-hotspot-ieee-802-11-free-wifi.png",
          content_type: "text",
          title: i,
        });        
      }
      sendQuickReply(sender, "Ejemplo de quick reply", replies);
      break;
    default:
      //unhandled action, just send back the text
      handleMessages(messages, sender);
  }
}

async function handleMessage(message, sender) {
  switch (message.message) {
    case "text": // text
      for (const text of message.text.text) {
        if (text !== "") {
          await sendTextMessage(sender, text);
        }
      }
      break;
    case "quickReplies": // quick replies
      let replies = [];
      message.quickReplies.quickReplies.forEach((text) => {
        let reply = {
          content_type: "text",
          title: text,
          payload: text,
        };
        replies.push(reply);
      });
      await sendQuickReply(sender, message.quickReplies.title, replies);
      break;
    case "image": // image
      await sendImageMessage(sender, message.image.imageUri);
      break;
    case "payload":
      let desestructPayload = structProtoToJson(message.payload);
      var messageData = {
        recipient: {
          id: sender,
        },
        message: desestructPayload.facebook,
      };
      await callSendAPI(messageData);
      break;
    default:
      break;
  }
}

async function handleCardMessages(messages, sender) {
  let elements = [];
  for (let m = 0; m < messages.length; m++) {
    let message = messages[m];
    let buttons = [];
    for (let b = 0; b < message.card.buttons.length; b++) {
      let isLink = message.card.buttons[b].postback.substring(0, 4) === "http";
      let button;
      if (isLink) {
        button = {
          type: "web_url",
          title: message.card.buttons[b].text,
          url: message.card.buttons[b].postback,
        };
      } else {
        button = {
          type: "postback",
          title: message.card.buttons[b].text,
          payload:
            message.card.buttons[b].postback === ""
              ? message.card.buttons[b].text
              : message.card.buttons[b].postback,
        };
      }
      buttons.push(button);
    }

    let element = {
      title: message.card.title,
      image_url: message.card.imageUri,
      subtitle: message.card.subtitle,
      buttons,
    };
    elements.push(element);
  }
  await sendGenericMessage(sender, elements);
}

async function handleMessages(messages, sender) {
  try {
    let i = 0;
    let cards = [];
    while (i < messages.length) {
      switch (messages[i].message) {
        case "card":
          for (let j = i; j < messages.length; j++) {
            if (messages[j].message === "card") {
              cards.push(messages[j]);
              i += 1;
            } else j = 9999;
          }
          await handleCardMessages(cards, sender);
          cards = [];
          break;
        case "text":
          await handleMessage(messages[i], sender);
          break;
        case "image":
          await handleMessage(messages[i], sender);
          break;
        case "quickReplies":
          await handleMessage(messages[i], sender);
          break;
        case "payload":
          await handleMessage(messages[i], sender);
          break;
        default:
          break;
      }
      i += 1;
    }
  } catch (error) {
    console.log(error);
  }
}

async function sendToDialogFlow(senderId, messageText) {
  sendTypingOn(senderId);
  try {
    let result;
    setSessionAndUser(senderId);
    let session = sessionIds.get(senderId);
    result = await dialogflow.sendToDialogFlow(
      messageText,
      session,
      "FACEBOOK"
    );
    handleDialogFlowResponse(senderId, result);
  } catch (error) {
    console.log("salio mal en sendToDialogflow...", error);
  }
}

function handleDialogFlowResponse(sender, response) {
  let responseText = response.fulfillmentMessages.fulfillmentText;
  let messages = response.fulfillmentMessages;
  let action = response.action;
  let contexts = response.outputContexts;
  let parameters = response.parameters;

  sendTypingOff(sender);

  if (isDefined(action)) {
    handleDialogFlowAction(sender, action, messages, contexts, parameters);
  } else if (isDefined(messages)) {
    handleMessages(messages, sender);
  } else if (responseText == "" && !isDefined(action)) {
    //dialogflow could not evaluate input.
    sendTextMessage(sender, "No entiendo lo que trataste de decir ...");
  } else if (isDefined(responseText)) {
    sendTextMessage(sender, responseText);
  }
}
async function getUserData(senderId) {
  console.log("consiguiendo datos del usuario...");
  let access_token = config.FB_PAGE_TOKEN;
  try {
    let userData = await axios.get(
      "https://graph.facebook.com/v6.0/" + senderId,
      {
        params: {
          access_token,
        },
      }
    );
    return userData.data;
  } catch (err) {
    console.log("algo salio mal en axios getUserData: ", err);
    return {
      first_name: "",
      last_name: "",
      profile_pic: "",
    };
  }
}

async function sendTextMessage(recipientId, text) {
  if (text.includes("{first_name}") || text.includes("{last_name}")) {
    let userData = await getUserData(recipientId);
    text = text
      .replace("{first_name}", userData.first_name)
      .replace("{last_name}", userData.last_name);
  }
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: text,
    },
  };
  await callSendAPI(messageData);
}

/*
 * Send an image using the Send API.
 *
 */
async function sendImageMessage(recipientId, imageUrl) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: imageUrl,
        },
      },
    },
  };
  await callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
async function sendButtonMessage(recipientId, text, buttons) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: buttons,
        },
      },
    },
  };
  await callSendAPI(messageData);
}

async function sendGenericMessage(recipientId, elements) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements,
        },
      },
    },
  };

  await callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
async function sendQuickReply(recipientId, text, replies, metadata) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: text,
      metadata: isDefined(metadata) ? metadata : "",
      quick_replies: replies,
    },
  };

  await callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    sender_action: "typing_on",
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    sender_action: "typing_off",
  };

  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData) {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: "https://graph.facebook.com/v6.0/me/messages",
        qs: {
          access_token: config.FB_PAGE_TOKEN,
        },
        method: "POST",
        json: messageData,
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var recipientId = body.recipient_id;
          var messageId = body.message_id;

          if (messageId) {
            console.log(
              "Successfully sent message with id %s to recipient %s",
              messageId,
              recipientId
            );
          } else {
            console.log(
              "Successfully called Send API for recipient %s",
              recipientId
            );
          }
          resolve();
        } else {
          reject();
          console.error(
            "Failed calling Send API",
            response.statusCode,
            response.statusMessage,
            body.error
          );
        }
      }
    );
  });
}

async function receivedPostback(event) {
  var senderId = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  var payload = event.postback.payload;
  switch (payload) {
    default:
      //unindentified payload
      sendToDialogFlow(senderId, payload);
      break;
  }

  console.log(
    "Received postback for user %d and page %d with payload '%s' " + "at %d",
    senderId,
    recipientID,
    payload,
    timeOfPostback
  );
}

function isDefined(obj) {
  if (typeof obj == "undefined") {
    return false;
  }

  if (!obj) {
    return false;
  }

  return obj != null;
}

module.exports = router;
