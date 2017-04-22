/**
 * Created by wcx73 on 2017/3/28.
 */
/* global EventEmitter, Topics, io, Peer */
import EventEmitter from "eventemitter3";
export default class ChatProxy extends EventEmitter {
    constructor(props) {
        super(props);
        let self = this;
        this._peers = {};
        this.name = props.name;
        console.log('peer_name:', this.name);
        this.peer = new Peer(this.name, {host: 'localhost', port: 9000});
        this.peer.on('open', function () {
            // $('#my-id').text(peer.id);
            console.log('peer.open');
        });
        this.peer.on('close', function () {
            // $('#my-id').text(peer.id);
            console.log('peer.close');
        });
        // Receiving a call
        this.peer.on('call', function (call) {
            console.log('local stream', window.localStream);
            call.answer(window.localStream);
            self.cb.addMessages({'name': self.name, 'text': 'hello'});
            self.updateCallStream(call);
            // call.on('stream', function (stream) {
            //     console.log('stream is coming', stream);
            //     self.cb.addPeer(call.peer);
            //     self.setVideoSrc(stream);
            // });
        });
        this.peer.on('error', function (err) {
            alert(err.message);
        });
    }

    setVideoSrc(stream) {
        this.cb.video.setState({src: URL.createObjectURL(stream)})
    }


    call(peer_id) {
        let call = this.peer.call(peer_id, window.localStream);
        this.updateCallStream(call);
    }

    endCall() {
        if (window.exsistingCall) {
            window.exsistingCall.close();
        }
    }

    setCallBack(cb) {
        let self = this;
        this.cb = cb;
        this.cb.addPeer(this.name);
        let config = this.name === 'ds' ? {audio: true, video: false} : {audio: true, video: true};
        navigator.getUserMedia(config, function (stream) {
            // Set your video displays
            self.setVideoSrc(stream);
            window.localStream = stream;
        }, function () {
            console.error('failed to call');
        });
    }

    updateCallStream(call) {
        let self = this;
        if (window.existingCall) {
            window.existingCall.close();
        }
        // Wait for stream on the call, then set peer video display
        call.on('stream', function (stream) {
            console.log('stream is coming');
            self.cb.addPeer(call.peer);
            self.setVideoSrc(stream);
        });
        window.exsistingCall = call;
        // UI stuff
        // window.existingCall = call;
        // $('#their-id').text(call.peer);
        // call.on('close', step2);
        // $('#step1, #step2').hide();
        // $('#step3').show();
    }

    // Click handlers setup
    // $(function () {
    //     $('#make-call').click(function () {
    //         // Initiate a call!
    //         var call = peer.call($('#callto-id').val(), window.localStream);
    //         step3(call);
    //     });
    //     $('#end-call').click(function () {
    //         window.existingCall.close();
    //         step2();
    //     });
    //     // Retry if getUserMedia fails
    //     $('#step1-retry').click(function () {
    //         $('#step1-error').hide();
    //         step1();
    //     });
    //     // Get things started
    //     step1();
    // });
    // function step1() {
    //     // Get audio/video stream
    //     navigator.getUserMedia({audio: true, video: true}, function (stream) {
    //         // Set your video displays
    //         $('#my-video').prop('src', URL.createObjectURL(stream));
    //         window.localStream = stream;
    //         step2();
    //     }, function () {
    //         $('#step1-error').show();
    //     });
    // }
    //
    // function step2() {
    //     $('#step1, #step3').hide();
    //     $('#step2').show();
    // }
    //


}