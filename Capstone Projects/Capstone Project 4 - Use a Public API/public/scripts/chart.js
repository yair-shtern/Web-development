import { preprocessData, createSequences, trainModel, predict } from './model.js';

document.addEventListener('DOMContentLoaded', async function () {
    await tf.setBackend('cpu');

    if (typeof stockData !== 'undefined') {
        const seriesData = [];
        const timeSeries = JSON.parse(stockData)["Time Series (Daily)"];

        if (timeSeries) {
            for (let [timestamp, values] of Object.entries(timeSeries)) {
                seriesData.push({
                    x: new Date(timestamp).getTime(),
                    y: [
                        parseFloat(values["1. open"]),
                        parseFloat(values["2. high"]),
                        parseFloat(values["3. low"]),
                        parseFloat(values["4. close"])
                    ]
                });
            }
        }

        seriesData.sort((a, b) => a.x - b.x);

        const options = {
            chart: {
                type: 'candlestick',
                height: 400
            },
            series: [{
                name: 'Stock Prices',
                data: seriesData
            }],
            xaxis: {
                type: 'datetime',
                labels: {
                    format: 'MMM dd'
                }
            },
            yaxis: {
                tooltip: {
                    enabled: true
                }
            }
        };

        const chart = new ApexCharts(document.querySelector("#stockChart"), options);
        chart.render();

        try {
            const preprocessedData = preprocessData(seriesData);

            const seqLength = 10;
            const { xs, ys } = createSequences(preprocessedData, seqLength);

            // console.log("Sequences:", { xs, ys }); // Add this line to debug the sequences

            const splitIndex = Math.floor(xs.length * 0.8);
            const xsTrain = xs.slice(0, splitIndex);
            const ysTrain = ys.slice(0, splitIndex);
            const xsTest = xs.slice(splitIndex);
            const ysTest = ys.slice(splitIndex);

            const model = await trainModel(xsTrain, ysTrain, seqLength);

            const xsTestTensor = tf.tensor3d(xsTest);
            const ysTestTensor = tf.tensor2d(ysTest, [ysTest.length, 1]);
            const evaluation = await model.evaluate(xsTestTensor, ysTestTensor);
            const accuracy = evaluation[1].dataSync()[0];

            console.log(`Model accuracy on test set: ${(accuracy * 100).toFixed(2)}%`);

            const accuracyDiv = document.createElement('div');
            accuracyDiv.innerHTML = `<h3>Model accuracy: ${(accuracy * 100).toFixed(2)}%</h3>`;
            document.body.appendChild(accuracyDiv);

            const lastSequence = preprocessedData.slice(-seqLength);
            const lastClose = seriesData[seriesData.length - 1].y[3];
            const prediction = predict(model, lastSequence, seqLength, lastClose);

            const predictionDiv = document.createElement('div');
            predictionDiv.innerHTML = `
                <h3>Prediction for next day:</h3>
                <p>Trend: ${prediction.trend}</p>
                <p>Probability: ${(prediction.probability * 100).toFixed(2)}%</p>
                <p>Estimated change: ${(prediction.estimatedChange * 100).toFixed(2)}%</p>
                <p>Predicted price: $${prediction.predictedPrice.toFixed(2)}</p>
            `;
            document.body.appendChild(predictionDiv);

            const lastDate = new Date(seriesData[seriesData.length - 1].x);
            const nextDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);

            chart.appendData([{
                x: nextDate.getTime(),
                y: [prediction.predictedPrice, prediction.predictedPrice, prediction.predictedPrice, prediction.predictedPrice]
            }]);
        } catch (error) {
            console.error('Error in processing or prediction:', error);
        }
    } else {
        console.error('Stock data is not defined');
    }
});
