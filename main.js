const params = new URLSearchParams(window.location.search);

if (!params.has("ica"))
    reloadWithIca(prompt("Initial cars amount:"));

const SNAPSHOTS_PERIOD = 5;
const SESSION_DURATION = 10 * 60;
const TRAFFIC_SIZE = 5;
const INITIAL_CARS_AMOUNT = parseInt(params.get("ica"));
const RESPAWN = false;

let running = true;

const roadCanvas = document.getElementById("mainCanvas");
roadCanvas.width = 200;

const roadCtx = roadCanvas.getContext("2d");
const road = new Road(roadCanvas.width / 2, roadCanvas.width * .9, 3)
let leader = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");

if (localStorage.getItem("bestBrain"))
    leader.brain = JSON.parse(localStorage.getItem("bestBrain"));

let cars = generateCars(INITIAL_CARS_AMOUNT, leader);
let traffic = generateTraffic(TRAFFIC_SIZE, true);
let globalTrafficIndex = INITIAL_CARS_AMOUNT;

const initialLeader = leader.clone();

const snapshots = [new Snapshot(road, traffic, leader, globalTrafficIndex), new Snapshot(road, traffic, leader, globalTrafficIndex)];

function animate() {
    if (running) {
        traffic = traffic.filter(trafficCar => (trafficCar.y <= leader.y + roadCanvas.height * 0.3));
        while (traffic.length < TRAFFIC_SIZE) {
            globalTrafficIndex++;
            console.log("boom");
            traffic.push(new Car(road.getLaneCenter(Math.round(Math.random() * 10) % road.laneCount), leader.y - 300 * (Math.random() / 2 + 2.5), 30, 50, "DUMMY", 2 + Math.random() * 0.5 - 0.3));
        }

        traffic.forEach(dummyCar => dummyCar.update(road, []));
        cars.forEach(car => car.update(road, traffic));

        cars = cars.filter(car => (!car.damaged && car.y <= leader.y + roadCanvas.height * 0.3));

        cars.forEach(car => {
            if (car.getRating(road) > leader.getRating(road) || leader.damaged)
                leader = car;
        });
    }

    roadCanvas.height = window.innerHeight;

    roadCtx.save();
    roadCtx.translate(0, -leader.y + roadCanvas.height * 0.7);

    road.draw(roadCtx);
    traffic.forEach(dummyCar => dummyCar.draw(roadCtx));
    roadCtx.globalAlpha = 0.2;
    cars.forEach(car => car.draw(roadCtx, false));
    roadCtx.globalAlpha = 1;

    if (leader.polygon[0]) {
        leader.draw(roadCtx, true);
    }

    roadCtx.restore();

    if ((/*Math.abs(leader.y) > 15000 || */leader.damaged || cars.length < 3) && INITIAL_CARS_AMOUNT > 1) {
        reloadFromPreviousSnapshot();
    } else if (leader.damaged && INITIAL_CARS_AMOUNT === 1)
        location.reload();

    requestAnimationFrame(animate);
}

function reloadFromPreviousSnapshot() {
    running = false;
    console.log("Reloading from the previous snapshot..");

    let snapshotToLoad = snapshots[1];

    if (snapshotToLoad.secondsElapsedSinceTaken() < SNAPSHOTS_PERIOD / 2)
        snapshotToLoad = snapshots[0];

    traffic = snapshotToLoad.traffic;
    leader = snapshotToLoad.leader;
    globalTrafficIndex = snapshotToLoad.globalTrafficIndex;

    cars.filter(_ => false);
    cars = generateCars(INITIAL_CARS_AMOUNT - 1, leader,0.02);
    cars.push(leader);

    running = true;
}

function save(doMerge = true) {
    if (doMerge) {
        let currentLeader = leader.clone();
        leader.brain = NeuNet.merge(initialLeader.brain, currentLeader.brain, 0.15);
    }

    localStorage.setItem("bestBrain", JSON.stringify(leader.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("prevBestY");
}

function togglePause(button) {
    running = !running;
    button.innerHTML = running ? "| |" : ">"
    document.getElementById("currentBrain").innerHTML = JSON.stringify(leader.brain);
}

function copyCurrentBrain() {
    navigator.clipboard.writeText(JSON.stringify(leader.brain));
}

function applyCurrentBrain() {
    const strData = document.getElementById("customBrain").value;
    console.log(strData);
    leader.brain = JSON.parse(strData);
}

function reloadWithIca(ica, doSave = false) {
    if (doSave)
        save();

    params.set("ica", ica);

    window.location.search = params.toString();
    console.log(window.location.search)
    // window.location.reload()
}

setInterval(function () {
    if (!running || leader.damaged)
        return;

    snapshots[0].copyFrom(snapshots[1]);
    snapshots[1].setData(road, traffic, leader, globalTrafficIndex);

    console.log("Taken snapshot; after previous: ", snapshots[0].secondsElapsedSinceTaken());
}, SNAPSHOTS_PERIOD * 1000);

setTimeout(_ => {
    if (running && INITIAL_CARS_AMOUNT > 1) {
        save();
        location.reload();
    }

}, SESSION_DURATION * 1000)

animate();