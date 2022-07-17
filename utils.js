const inf = 1000000;

function getIntersection(A1, A2, B1, B2) {
    const k_A = (A2.y - A1.y) / (A2.x - A1.x);
    const b_A = A1.y - k_A * A1.x;

    const k_B = (B2.y - B1.y) / (B2.x - B1.x);
    const b_B = B1.y - k_B * B1.x;

    if (k_B !== k_A) {
        // solve the equation k_A * X + b_A = k_B * X + b_B
        // rearrange: X * (k_A - k_B) = b_B - b_A

        let X = (b_B - b_A) / (k_A - k_B);
        let Y = k_A * X + b_A;

        if (A2.x === A1.x && B2.x !== B1.x) {
            X = A1.x;
            Y = k_B * X + b_B;
        } else if (B2.x === B1.x && A2.x !== A1.x) {
            X = B1.x;
            Y = k_A * X + b_A;
        }

        // check if the point is within the two segments

        if (
            X >= Math.max(Math.min(A1.x, A2.x), Math.min(B1.x, B2.x)) &&
            X <= Math.min(Math.max(A1.x, A2.x), Math.max(B1.x, B2.x)) &&

            Y >= Math.max(Math.min(A1.y, A2.y), Math.min(B1.y, B2.y)) &&
            Y <= Math.min(Math.max(A1.y, A2.y), Math.max(B1.y, B2.y))
        ) {
            return {x: X, y: Y};
        }
    }

    return null;
}

function distSq(A, B) {
    return (A.x - B.x) ** 2 + (A.y - B.y) ** 2;
}

function polysIntersect(p1, p2) {
    for (let i = 0; i < p1.length; ++i) {
        for (let j = 0; j < p2.length; ++j) {
            const touch = getIntersection(
                p1[i], p1[(i + 1) % p1.length],
                p2[j], p2[(j + 1) % p2.length]
            );

            if (touch)
                return true;
        }
    }

    return false;
}