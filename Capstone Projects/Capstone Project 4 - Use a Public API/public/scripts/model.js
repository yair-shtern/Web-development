const preprocessData = (data) => {
    if (!data || !Array.isArray(data) || !data.length) {
        console.error('Invalid data for preprocessing:', data);
        return [];
    }
    console.log('Preprocessing data...');
    const processedData = data.map(item => [
        parseFloat(item.y[0]), // Open
        parseFloat(item.y[1]), // High
        parseFloat(item.y[2]), // Low
        parseFloat(item.y[3]), // Close
        parseFloat(item.y[0]) - parseFloat(item.y[3]), // open-close
        parseFloat(item.y[1]) - parseFloat(item.y[2])  // high-low
    ]);

    const normalizedData = normalizeData(processedData);
    console.log('Data preprocessed.');
    return normalizedData;
};

const normalizeData = (data) => {
    const min = data.reduce((acc, row) => row.map((val, i) => Math.min(val, acc[i])), data[0]);
    const max = data.reduce((acc, row) => row.map((val, i) => Math.max(val, acc[i])), data[0]);

    return data.map(row => row.map((val, i) => (val - min[i]) / (max[i] - min[i])));
};

const createSequences = (data, seqLength) => {
    if (!data || !Array.isArray(data) || !data.length) {
        console.error('Invalid data for sequence creation:', data);
        return { xs: [], ys: [] };
    }
    console.log('Creating sequences...');
    const xs = [];
    const ys = [];
    for (let i = 0; i < data.length - seqLength; i++) {
        xs.push(data.slice(i, i + seqLength));
        ys.push(data[i + seqLength][3] > data[i + seqLength - 1][3] ? 1 : 0); // 1 if price increased, 0 if decreased
    }
    console.log('Sequences created.');
    return { xs, ys };
};

const trainModel = async (xs, ys, seqLength) => {
    if (!xs.length || !ys.length) {
        console.error('Invalid data for model training:', xs, ys);
        return null;
    }
    console.log('Training the model...');
    const xsTensor = tf.tensor3d(xs);
    const ysTensor = tf.tensor2d(ys, [ys.length, 1]);

    const model = tf.sequential();
    model.add(tf.layers.lstm({
        units: 100, // Increased units
        returnSequences: true,
        inputShape: [seqLength, 6]
    }));
    model.add(tf.layers.lstm({
        units: 100, // Increased units
        returnSequences: false
    }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({
        optimizer: tf.train.adam(0.001), // Learning rate adjustment
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    await model.fit(xsTensor, ysTensor, {
        epochs: 250, // Increased epochs
        batchSize: 32,
        validationSplit: 0.1,
        callbacks: tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 10 })
    });

    console.log('Model trained!');
    return model;
};


const predict = (model, inputData, seqLength, lastClose) => {
    if (!inputData.length) {
        console.error('Invalid input data for prediction:', inputData);
        return null;
    }
    console.log('Making predictions...');
    const inputTensor = tf.tensor3d([inputData]);
    const prediction = model.predict(inputTensor);
    const probabilityUp = prediction.dataSync()[0];
    console.log('Probability of price going up:', probabilityUp);

    // Estimate the percentage change
    const estimatedChange = (probabilityUp - 0.5) * 0.02; // 2% maximum change
    const predictedPrice = lastClose * (1 + estimatedChange);

    return {
        trend: probabilityUp > 0.5 ? "Up" : "Down",
        probability: probabilityUp,
        estimatedChange: estimatedChange,
        predictedPrice: predictedPrice
    };
};

export { preprocessData, createSequences, trainModel, predict };