export class NotificationManager {
	private static instance: NotificationManager;
	private permission: NotificationPermission = 'default';

	private constructor() {
		this.permission = Notification.permission;
	}

	static getInstance(): NotificationManager {
		if (!NotificationManager.instance) {
			NotificationManager.instance = new NotificationManager();
		}
		return NotificationManager.instance;
	}

	async requestPermission(): Promise<boolean> {
		if (!('Notification' in window)) {
			console.log('This browser does not support notifications');
			return false;
		}

		if (this.permission === 'granted') {
			return true;
		}

		const permission = await Notification.requestPermission();
		this.permission = permission;
		return permission === 'granted';
	}

	async showNotification(title: string, options?: NotificationOptions): Promise<void> {
		if (this.permission !== 'granted') {
			const granted = await this.requestPermission();
			if (!granted) return;
		}

		const defaultOptions: any = {
			icon: '/favicon.svg',
			badge: '/favicon.svg',
			vibrate: [100, 50, 100],
			...options
		};

		if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
			// Use service worker for notifications
			navigator.serviceWorker.ready.then((registration) => {
				registration.showNotification(title, defaultOptions);
			});
		} else {
			// Fallback to regular notification
			new Notification(title, defaultOptions);
		}
	}

	async showBillReminder(billTitle: string, amount: number, deadline: string): Promise<void> {
		await this.showNotification('Reminder Tagihan', {
			body: `${billTitle} - Rp ${amount.toLocaleString()}\nDeadline: ${deadline}`,
			tag: 'bill-reminder'
		} as any);
	}

	async showPaymentConfirmation(billTitle: string): Promise<void> {
		await this.showNotification('Pembayaran Berhasil', {
			body: `Bukti pembayaran untuk "${billTitle}" telah diupload`,
			tag: 'payment-success'
		});
	}
}
