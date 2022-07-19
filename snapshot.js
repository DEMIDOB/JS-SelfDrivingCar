class Snapshot {
    constructor(road, traffic, leader, globalTrafficIndex) {
        this.setData(road, traffic, leader, globalTrafficIndex);
    }

    setData(road, traffic, leader, globalTrafficIndex) {
        this.road = clone(road);
        this.traffic = [];
        this.leader = leader.clone();
        this.globalTrafficIndex = globalTrafficIndex;
        this.timestamp = Date.now();

        for (let i = 0; i < traffic.length; ++i) {
            this.traffic.push(traffic[i].clone());
            // console.log(this.traffic[i]);
        }
    }

    copyFrom(snp) {
        this.road = snp.road;
        this.traffic = snp.traffic;
        this.leader = snp.leader;
        this.globalTrafficIndex = snp.globalTrafficIndex;
        this.timestamp = snp.timestamp;
    }

    secondsElapsedSinceTaken() {
        return Math.floor((Date.now() - this.timestamp) / 1000);
    }
}