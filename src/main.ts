import { generateFakeData } from "./data/generator";
import { EngagementModel } from "./model/engagement";
import { ABTestingSimulator } from "./testing/abSimulator";

/**
 * Main application function that demonstrates the complete workflow
 * Shows how everything works together in a real scenario
 */
async function main() {
	try {
		// Step 1: Generate sample data
		const trainingData = generateFakeData(500);

		// Step 2: Create and train the AI model
		console.log("Setting up AI model...");
		const model = new EngagementModel();
		await model.initialize();

		// Step 3: Train the model
		console.log("Training model...");
		await model.train(trainingData);

		// Step 4: Set up A/B testing
		const abTester = new ABTestingSimulator();

		// Step 5: Start a test with two different titles
		const testBlock = trainingData[0].block_id;
		abTester.startTest(testBlock, "Welcome to Our Site", "Exclusive Offers Inside");

		// Step 6: Record engagement data for the test
		trainingData.forEach((data) => {
			if (data.block_id === testBlock) {
				abTester.recordEngagement(data);
			}
		});

		// Step 7: Get and display test results
		const results = abTester.getTestResults(testBlock);
		console.log("AB Test Results:", results);
	} catch (error) {
		console.error("Application error:", error);
		process.exit(1);
	}
}

// Start the application
main().catch(console.error);
