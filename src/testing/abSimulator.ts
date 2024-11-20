import { EngagementData } from "../data/generator";

/**
 * ABTestingSimulator: Simulates A/B testing of different content versions
 * Like running experiments to see which version works better
 */
export class ABTestingSimulator {
	// Stores active tests and their results
	private activeTests: Map<
		string,
		{
			variantA: string; // Version A content
			variantB: string; // Version B content
			metrics: {
				// Track performance metrics
				[key: string]: {
					clicks: number; // Total clicks
					conversions: number; // Total conversions
					totalEngagement: number; // Total engagement time
				};
			};
		}
	>;

	constructor() {
		this.activeTests = new Map();
	}

	/**
	 * Start a new A/B test for a piece of content
	 * Like setting up a new experiment
	 */
	startTest(blockId: string, variantA: string, variantB: string) {
		this.activeTests.set(blockId, {
			variantA,
			variantB,
			metrics: {
				A: { clicks: 0, conversions: 0, totalEngagement: 0 },
				B: { clicks: 0, conversions: 0, totalEngagement: 0 },
			},
		});
	}

	/**
	 * Record user engagement with a variant
	 * Like taking notes during the experiment
	 */
	recordEngagement(data: EngagementData) {
		const test = this.activeTests.get(data.block_id);
		if (!test) return;

		// Add up all the engagement metrics for this variant
		const metrics = test.metrics[data.variant];
		metrics.clicks += data.click_count;
		metrics.conversions += data.conversions;
		metrics.totalEngagement += data.engagement_duration;
	}

	/**
	 * Get the results of an A/B test
	 * Like analyzing the experiment results
	 */
	getTestResults(blockId: string) {
		const test = this.activeTests.get(blockId);
		if (!test) return null;

		const { metrics } = test;
		// Calculate overall scores for each variant
		const variantAScore = this.calculateScore(metrics.A);
		const variantBScore = this.calculateScore(metrics.B);

		return {
			winner: variantAScore > variantBScore ? "A" : "B",
			scores: {
				A: variantAScore,
				B: variantBScore,
			},
		};
	}

	/**
	 * Calculate an overall score for a variant
	 * Combines different metrics into one number
	 */
	private calculateScore(metrics: { clicks: number; conversions: number; totalEngagement: number }) {
		return (metrics.clicks + metrics.conversions * 10 + metrics.totalEngagement) / 3;
	}
}
