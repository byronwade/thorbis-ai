import { generateFakeData } from "../data/generator";
import { EngagementModel } from "./engagement";

/**
 * Main training function that sets up and trains the AI model
 * Think of this as teaching the AI using practice data
 */
async function trainModel() {
	try {
		// Step 1: Create practice data for the AI
		console.log("Generating training data...");
		const trainingData = generateFakeData(500); // Generate 500 examples

		// Step 2: Set up the AI model
		console.log("Initializing model...");
		const model = new EngagementModel();
		await model.initialize();

		// Step 3: Train the model with our practice data
		console.log("Starting training process...");
		// Train for 10 epochs (rounds of learning)
		const result = await model.train(trainingData, 10);
		console.log("Training metrics:", result.history);

		// Step 4: Test the model with one example
		const testData = trainingData[0]; // Use first example as test
		const prediction = await model.predict(testData);
		console.log("Test prediction:", prediction);
	} catch (error) {
		// Handle any errors during training
		console.error("Training failed:", error);
		process.exit(1); // Stop the program if training fails
	}
}

// Catch any unexpected errors
process.on("unhandledRejection", (error) => {
	console.error("Unhandled rejection:", error);
	process.exit(1);
});

// Start the training process
trainModel();
