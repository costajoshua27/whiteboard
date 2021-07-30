class RecordingManager {
    constructor() {
        this.recorder = null;
        this.streams = {};
        this.chunks = [];
    }

    addStream(k, stream) {
        this.streams[k] = stream;
        if (this.recorder) {
            this.setupRecorder();
            this.recorder.start(1000);
        }
    }

    removeStream(k) {
        delete this.streams[k];
        if (this.recorder) {
            this.setupRecorder();
            this.recorder.start(1000);
        }
    }

    download() {
        // console.log("downloading these chunks...", this.chunks);
        let blob = new Blob(this.chunks, {
            type: "audio/webm",
        });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = "test.webm";
        a.click();
        window.URL.revokeObjectURL(url);

        this.chunks = [];
    }

    setupRecorder() {
        if (this.recorder) {
            this.recorder.stop();
        }

        // const cont = new AudioContext();
        // const streamsToAdd = Object.values(this.streams).map(stream =>
        //     cont.createMediaStreamSource(stream)
        // );
        // const dest = cont.createMediaStreamDestination();
        // streamsToAdd.forEach(stream => stream.connect(dest));

        const tracks = [];
        Object.values(this.streams).forEach((stream) => tracks.push(...stream.getAudioTracks()));
        const newStream = new MediaStream([...tracks]);

        this.recorder = new MediaRecorder(newStream, { mimeType: "audio/webm" });
        const chunksRef = this.chunks;
        this.recorder.ondataavailable = function (e) {
            console.log(e.data);
            chunksRef.push(e.data);
        };
    }

    toggleRecord(e, recognition) {
        if (!this.recorder) {
            e.target.style.color = "red";
            this.setupRecorder();
            console.log(this.recorder);
            this.recorder.start(1000);
            console.log(this.recorder);
            recognition.start(); 
        } else {
            e.target.style.color = "black";
            this.recorder.stop();
            this.recorder = null;
            this.download();
            recognition.abort();
        }
    }
}

export default RecordingManager;
