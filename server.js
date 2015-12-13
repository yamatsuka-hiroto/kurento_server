var kurento = require("kurento-client");

var kurentoClient = null;
const ws_uri = "ws://104.154.55.190:8888/kurento";

function prepaereKurento() {
    kurento(ws_uri, function (error, client) {
        if (error) {
            return error;
        }

        kurentoClient = client;
    });
}

prepaereKurento();


// -- create the cokcet server on the port
var srv = require("http").Server();
var io = require("socket.io")(srv);
var port = 9001;
srv.listen(port);
io.on("connection", function (socket) {
    socket.on("echoback_request", function (sdp) {
        handleEchobackOffer(sdp, socket);
    });

});

var media_pipeline = null;
function handleEchobackOffer(sdp, socket){
    kurentoClient.create("MediaPipeline",function(error,pipeline){
        if(error){
            onError(error);
            return null;
        }
        media_pipeline = pipeline;

        pipeline.create("WebRtcEndpoint",function(error,webRtcEndpoint){
            webRtcEndpoint.connect(webRtcEndpoint,function(error){
                webRtcEndpoint.processOffer(sdp,function(error,sdpAnswer){
                    socket.emit("echoback_response",{sdp:sdpAnswer});
                });
            });
        });
    });
}
