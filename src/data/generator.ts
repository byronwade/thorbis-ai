import { v4 as uuidv4 } from "uuid";

/**
 * Defines what information we collect about user engagement
 * Think of this as a form that tracks how users interact with content
 */
export interface EngagementData {
	block_id: string;
	title: string;
	content: string;
	click_count: number;
	hover_time: number;
	engagement_duration: number;
	click_target: "button" | "image" | "text" | "link";
	variant: "A" | "B";
	ab_test_group: "A" | "B";
	conversions: number;
}

// Different versions of titles we can test
const titleVariants = {
	A: ["Welcome to Our Site", "Discover Amazing Deals", "Start Your Journey"],
	B: ["Exclusive Offers Inside", "Transform Your Experience", "Join Our Community"],
};

/**
 * Creates fake data to train and test our AI
 * Like creating practice examples for the AI to learn from
 */
export function generateFakeData(count: number = 500): EngagementData[] {
	return Array.from({ length: count }, () => ({
		block_id: uuidv4(),
		title: Math.random() > 0.5 ? titleVariants.A[Math.floor(Math.random() * titleVariants.A.length)] : titleVariants.B[Math.floor(Math.random() * titleVariants.B.length)],
		content: "Sample content description",
		click_count: Math.floor(Math.random() * 200),
		hover_time: Math.random() * 100,
		engagement_duration: Math.random() * 60,
		click_target: ["button", "image", "text", "link"][Math.floor(Math.random() * 4)] as any,
		variant: Math.random() > 0.5 ? "A" : "B",
		ab_test_group: Math.random() > 0.5 ? "A" : "B",
		conversions: Math.floor(Math.random() * 30),
	}));
}
