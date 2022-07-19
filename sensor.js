class Sensor {
    constructor(car) {
        this.car = car;
        this.rayCount = 27;
        this.rayLength = 300;
        this.raySpread = Math.PI;

        this.rays = [];
        this.readings = [];
    }

    clone() {
        let copy = new Sensor(this.car);

        copy.rayCount = this.rayCount;
        copy.rayLength = this.rayLength;
        copy.raySpread = this.raySpread;

        copy.rays = this.rays;
        copy.readings = this.readings;

        return copy;
    }

    update(roadBorders, traffic) {
        this.#castRays();

        let segments = [];

        roadBorders.forEach(border => segments.push(border));
        traffic.forEach(car => {
            if (!(car.x === this.car.x && car.y === this.car.y)) {
                for (let i = 0; i < car.polygon.length; ++i) {
                    segments.push([car.polygon[i], car.polygon[(i + 1) % car.polygon.length]]);
                }
            }
        });

        this.readings = [];
        this.rays.forEach(ray => {
            const reading = this.#getReading(ray, segments);
            this.readings.push(reading);
        });
    }

    #getReading(ray, roadBorders) {
        let closestTouch = null;
        let closestTouchDistSq = inf;

        roadBorders.forEach(border => {
            const touch = getIntersection(
                border[0], border[1],
                ray[0], ray[1],
            );

            if (touch) {
                const currentDistSq = distSq(ray[0], touch);
                if (currentDistSq < closestTouchDistSq) {
                    closestTouch = touch;
                    closestTouchDistSq = currentDistSq;
                }
            }
        });

        if (closestTouchDistSq === inf)
            return null;

        return {x: closestTouch.x, y: closestTouch.y, offset: Math.sqrt(closestTouchDistSq) / this.rayLength};
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; ++i) {
            const rayAngle = (this.raySpread * i / (this.rayCount - 1)) - this.raySpread / 2 - this.car.angle; // + (this.raySpread * 0.5 / (this.rayCount - 1));

            const startPoint = {x: this.car.x, y: this.car.y};
            const endPoint = {x: this.car.x + Math.sin(rayAngle) * this.rayLength, y: this.car.y - Math.cos(rayAngle) * this.rayLength}

            this.rays.push([startPoint, endPoint]);
        }
    }

    draw(ctx) {
        let i = 0;

        this.rays.forEach(ray => {
            ctx.beginPath();

            ctx.lineWidth = 2;
            ctx.strokeStyle = "#FFFF0050";

            if (this.readings[i] != null)
                ctx.strokeStyle = "#FF000050";

            ctx.moveTo(ray[0].x, ray[0].y);

            if (this.readings[i] != null)
                ctx.lineTo(this.readings[i].x, this.readings[i].y);
            else
                ctx.lineTo(ray[1].x, ray[1].y);

            ctx.stroke();

            i++;
        });
    }
}
