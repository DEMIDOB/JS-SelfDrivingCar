class NeuNet {
    constructor(neuronCounts) {
        this.layers = [];

        for (let i = 0; i < neuronCounts.length - 1; ++i) {
            this.layers.push(new Layer(neuronCounts[i], neuronCounts[i + 1]));
        }
    }

    static forward(inputs, net) {
        let outputs = Layer.forward(inputs, net.layers[0]);

        for (let i = 1; i < net.layers.length; ++i) {
            outputs = Layer.forward(outputs, net.layers[i]);
        }

        return outputs;
    }
}

class Layer {
    constructor(inputsCount, outputsCount) {
        this.inputs = new Array(inputsCount);
        this.outputs = new Array(outputsCount);
        this.biases = new Array(outputsCount);

        this.weights = [];

        for (let i = 0; i < inputsCount; ++i) {
            this.weights.push(new Array(outputsCount));
        }

        Layer.#randomize(this);
    }

    static #randomize(layer) {
        for (let i = 0; i < layer.inputs.length; ++i) {
            for (let j = 0; j < layer.outputs.length; ++j) {
                layer.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < layer.biases.length; ++i) {
            layer.biases[i] = Math.random() * 2 - 1;
        }
    }

    static forward(inputs, layer) {
        for (let i = 0; i < layer.inputs.length; ++i) {
            layer.inputs[i] = inputs[i];
        }

        for (let i = 0; i < layer.outputs.length; ++i) {
            let sum = 0;

            for (let j = 0; j < inputs.length; ++j) {
                sum += inputs[j] * layer.weights[j][i];
            }

            if (sum > layer.biases[i])
                layer.outputs[i] = 1;
            else
                layer.outputs[i] = 0;
        }

        return layer.outputs;
    }
}