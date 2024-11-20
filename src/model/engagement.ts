import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";
import { EngagementData } from "../data/generator";

/**
 * EngagementModel: The main AI model that learns from user interactions
 * and predicts content performance
 */
export class EngagementModel {
	// The neural network model that will learn patterns
	private model: tf.LayersModel;

	constructor() {
		this.model = this.buildModel();
	}

	// Set up the AI environment
	async initialize() {
		await tf.ready();
		await tf.setBackend("cpu"); // Use CPU for calculations
		console.log("Using backend:", tf.getBackend());
	}

	/**
	 * Builds the neural network architecture
	 * Think of this as creating the AI's brain structure
	 */
	private buildModel() {
		const model = tf.sequential();

		// First layer: 128 neurons (like 128 tiny decision makers)
		// They look at 7 different pieces of information about user behavior
		model.add(
			tf.layers.dense({
				units: 128, // Number of neurons
				activation: "relu", // How neurons decide to fire
				inputShape: [7], // 7 input features
				kernelInitializer: "glorotNormal", // How to start the learning process
			})
		);
		// Dropout: Randomly turn off 30% of neurons to prevent over-memorization
		model.add(tf.layers.dropout({ rate: 0.3 }));

		// Second layer: 64 neurons that combine information from first layer
		model.add(
			tf.layers.dense({
				units: 64,
				activation: "relu",
				kernelInitializer: "glorotNormal",
			})
		);
		model.add(tf.layers.dropout({ rate: 0.2 }));

		// Third layer: 32 neurons for final processing
		model.add(
			tf.layers.dense({
				units: 32,
				activation: "relu",
				kernelInitializer: "glorotNormal",
			})
		);

		// Get the processed information from previous layers
		const shared = model.outputs[0];

		// Create two separate outputs:
		// 1. Score prediction (how well content will perform)
		const scoreOutput = tf.layers
			.dense({
				units: 1, // One number output
				activation: "sigmoid", // Converts output to 0-1 range
				name: "score",
			})
			.apply(shared) as tf.SymbolicTensor;

		// 2. Variant prediction (which version A/B is better)
		const variantOutput = tf.layers
			.dense({
				units: 2, // Two outputs (A and B)
				activation: "softmax", // Converts to probabilities
				name: "variant",
			})
			.apply(shared) as tf.SymbolicTensor;

		// Combine everything into final model
		const finalModel = tf.model({
			inputs: model.input,
			outputs: [scoreOutput, variantOutput],
		});

		// Set up how the model will learn
		finalModel.compile({
			optimizer: tf.train.adam(0.001), // How fast to learn
			loss: {
				score: "meanSquaredError", // How to measure score prediction errors
				variant: "categoricalCrossentropy", // How to measure variant prediction errors
			},
			metrics: {
				score: "mse", // Track score accuracy
				variant: "accuracy", // Track variant prediction accuracy
			},
		});

		return finalModel;
	}

	/**
	 * Train the model with engagement data
	 * Like teaching the AI by showing it examples
	 */
	async train(data: EngagementData[], epochs: number = 100) {
		const { inputs, outputs } = this.preprocessData(data);

		console.log("Starting training...");
		try {
			// Train the model multiple times on the same data
			const result = await this.model.fit(inputs, outputs, {
				epochs, // Number of training rounds
				batchSize: 32, // Process 32 examples at once
				validationSplit: 0.2, // Use 20% of data for testing
				shuffle: true, // Mix up the examples
				callbacks: {
					onEpochEnd: (epoch, logs) => {
						// Report progress after each training round
						console.log(`Epoch ${epoch + 1}/${epochs}: ` + `score_loss = ${logs?.["score_loss"]?.toFixed(4)}, ` + `variant_acc = ${logs?.["variant_accuracy"]?.toFixed(4)}`);
					},
				},
			});
			console.log("Training complete!");
			return result;
		} catch (error) {
			console.error("Training error:", error);
			throw error;
		} finally {
			// Clean up memory
			inputs.dispose();
			outputs[0].dispose();
			outputs[1].dispose();
		}
	}

	/**
	 * Prepare the raw data for the AI to understand
	 * Like translating human concepts into numbers
	 */
	private preprocessData(data: EngagementData[]) {
		console.log("Preprocessing data...");
		try {
			// Find the maximum values for normalization
			const maxClicks = Math.max(...data.map((d) => d.click_count));
			const maxHover = Math.max(...data.map((d) => d.hover_time));
			const maxEngagement = Math.max(...data.map((d) => d.engagement_duration));

			// Convert all inputs to numbers between 0 and 1
			const inputs = tf.tensor2d(data.map((d) => [d.click_count / maxClicks, d.hover_time / maxHover, d.engagement_duration / maxEngagement, d.click_target === "button" ? 1 : 0, d.click_target === "image" ? 1 : 0, d.click_target === "text" ? 1 : 0, d.click_target === "link" ? 1 : 0]));

			// Prepare the score outputs
			const scores = tf.tensor2d(data.map((d) => [(d.click_count + d.conversions * 10) / (maxClicks + 300)]));

			// Prepare the variant outputs (A/B testing)
			const variants = tf.tensor2d(data.map((d) => [d.variant === "A" ? 1 : 0, d.variant === "B" ? 1 : 0]));

			return { inputs, outputs: [scores, variants] };
		} catch (error) {
			console.error("Preprocessing error:", error);
			throw error;
		}
	}

	/**
	 * Make predictions on new data
	 * Like asking the AI what it thinks about new content
	 */
	async predict(data: EngagementData) {
		// Use fixed values for normalization in prediction
		const maxClicks = 200;
		const maxHover = 100;
		const maxEngagement = 60;

		// Prepare the input data
		const input = tf.tensor2d([[data.click_count / maxClicks, data.hover_time / maxHover, data.engagement_duration / maxEngagement, data.click_target === "button" ? 1 : 0, data.click_target === "image" ? 1 : 0, data.click_target === "text" ? 1 : 0, data.click_target === "link" ? 1 : 0]]);

		try {
			// Get predictions from the model
			const predictions = (await this.model.predict(input)) as tf.Tensor[];
			const scoreValues = (await predictions[0].array()) as number[][];
			const variantValues = (await predictions[1].array()) as number[][];

			// Return human-readable results
			return {
				score: scoreValues[0][0], // Engagement score (0-1)
				variantA: variantValues[0][0], // Probability of A being better
				variantB: variantValues[0][1], // Probability of B being better
			};
		} finally {
			// Clean up memory
			input.dispose();
		}
	}
}
