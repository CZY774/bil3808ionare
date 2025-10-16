/**
 * Format currency to IDR
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0
	}).format(amount);
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);
}

/**
 * Format date to short format (DD/MM/YYYY)
 */
export function formatDateShort(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('id-ID', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	}).format(date);
}

/**
 * Calculate days until deadline
 */
export function daysUntilDeadline(deadlineString: string): number {
	const deadline = new Date(deadlineString);
	const today = new Date();
	const diffTime = deadline.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
}

/**
 * Check if deadline is approaching (within 2 days)
 */
export function isDeadlineApproaching(deadlineString: string): boolean {
	const days = daysUntilDeadline(deadlineString);
	return days >= 0 && days <= 2;
}

/**
 * Check if deadline has passed
 */
export function isDeadlinePassed(deadlineString: string): boolean {
	return daysUntilDeadline(deadlineString) < 0;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
	return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Generate storage path for proof upload
 */
export function generateProofPath(userId: string, billId: string, filename: string): string {
	const timestamp = Date.now();
	const extension = getFileExtension(filename);
	return `${userId}/${billId}_${timestamp}.${extension}`;
}

/**
 * Validate image file
 */
export function isValidImage(file: File): boolean {
	const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
	const maxSize = 5 * 1024 * 1024; // 5MB

	if (!validTypes.includes(file.type)) {
		return false;
	}

	if (file.size > maxSize) {
		return false;
	}

	return true;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		console.error('Failed to copy:', err);
		return false;
	}
}

/**
 * Parse payment method display
 * Input: "BCA - 1234567890"
 * Output: { bank: "BCA", account: "1234567890" }
 */
export function parsePaymentMethod(method: string | null): {
	bank: string;
	account: string;
} | null {
	if (!method) return null;

	const parts = method.split('-').map((s) => s.trim());
	if (parts.length !== 2) return null;

	return {
		bank: parts[0],
		account: parts[1]
	};
}

/**
 * Get initials from full name
 */
export function getInitials(fullName: string): string {
	const names = fullName.trim().split(' ');
	if (names.length === 1) {
		return names[0].charAt(0).toUpperCase();
	}
	return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}
