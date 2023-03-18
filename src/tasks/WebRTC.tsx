import {useEffect, useMemo, useRef, useState} from 'react'
import '../App.css';
const getConnectedDevices = async (type: string) => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === type)
}

const iceCandidates: any[] = [];
const CONFIGURATION = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };

const peerConnection = new RTCPeerConnection(CONFIGURATION);

function WebRTC() {
    const [offer, setOffer]: any = useState(null);
    const [answer, setAnswer]: any = useState(null);
    const [isAnswering, setIsAnswering] = useState(false);
    const [isOffering, setIsOffering] = useState(false);
    const [iceCandidate, setIceCandidate]: any = useState([]);

    const video: any = useRef(null);
    const remoteVideo: any = useRef(null);

    const makeCall = async () => {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        setOffer(offer);
        setIsOffering(true);
        setIsAnswering(false);
    }

    const receiveCall = async () => {
        if(offer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(offer)));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            setAnswer(answer);
        }
    };

    const initiateConnection = async () => {
        const remoteDesc = new RTCSessionDescription(JSON.parse(answer));
        await peerConnection.setRemoteDescription(remoteDesc);
    }
    const addCandidate = async () => {
        if (iceCandidate) {
            try {
                await Promise.all(iceCandidate.map((candidate: any) => peerConnection.addIceCandidate(candidate)));
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
    }

    useEffect(() => {
        const setUpCamera = async () => {
            const cameras: any = await getConnectedDevices('videoinput');
            const constraints: MediaStreamConstraints = {
                'audio': false,
                'video': {
                    deviceId: cameras[0],
                    'width': {'min': 1280},
                    'height': {'min': 720}
                }
            }
            const localStream = await navigator.mediaDevices.getUserMedia(constraints);
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
            video.current.srcObject = localStream;
        }
        setUpCamera();
        peerConnection.addEventListener('track', async (event) => {
            const [remoteStream] = event.streams;
            remoteVideo.current.srcObject = remoteStream;
        })
        peerConnection.addEventListener('icecandidate', (event) => {
            if (event.candidate) {
                iceCandidates.push(event.candidate);
            } else {
                setIceCandidate(iceCandidates);
            }
        });
        peerConnection.addEventListener('connectionstatechange', event => {
            if (peerConnection.connectionState === 'connected') {
                console.log('Peers connected');
            }
        });
    }, [])

    return (
        <div className="App">
            <button onClick={makeCall} disabled={isAnswering}>I am calling</button>
            <button onClick={() => {setIsAnswering(true)}} disabled={isOffering}>I am receiving the call</button>
            {isOffering && (
                <div>
                    <div className="App-col">
                        <p>Your offer:</p>
                        <textarea value={JSON.stringify(offer)} />
                    </div>
                    <div className="App-col">
                        <p>Your ICE candidate:</p>
                        <textarea value={JSON.stringify(iceCandidate)} />
                    </div>
                    <p>Answer data: <input onChange={(e) => setAnswer(e.target.value)} /></p>
                    <button onClick={initiateConnection}>Initiate connection</button>
                </div>
            )}
            {isAnswering && (
                <>
                    <div>Offer: <input onChange={(e) => setOffer(e.target.value)} /></div>
                    <div>Ice Candidate: <input onChange={(e) => setIceCandidate(JSON.parse(e.target.value))} /></div>
                    <button onClick={receiveCall} disabled={!offer}>Answer</button>
                    <button onClick={addCandidate} disabled={!iceCandidate.length}>Add ICE candidate</button>
                    {answer && <div>Your answer: <textarea value={JSON.stringify(answer)} /></div>}
                </>
            )}
            <div className="app-videos">
                <video id="localVideo" autoPlay playsInline ref={video} />
                <video id="remoteVideo" autoPlay playsInline ref={remoteVideo} />
            </div>
        </div>
    )
}

export default WebRTC
