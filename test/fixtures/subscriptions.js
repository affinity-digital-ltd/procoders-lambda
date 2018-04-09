module.exports = {
	"object": "list",
	"data": [
		{
			"id": "sub_CdHSJVXNFzHwzw",
			"object": "subscription",
			"application_fee_percent": null,
			"billing": "charge_automatically",
			"billing_cycle_anchor": 1523045442,
			"cancel_at_period_end": false,
			"canceled_at": null,
			"created": 1523045442,
			"current_period_end": 1525637442,
			"current_period_start": 1523045442,
			"customer": "cus_CdHSbapdSMSmRY",
			"days_until_due": null,
			"discount": null,
			"ended_at": null,
			"items": {
				"object": "list",
				"data": [
					{
						"id": "si_CdHSNXh2kkXUDK",
						"object": "subscription_item",
						"created": 1523045442,
						"metadata": {},
						"plan": {
							"id": "350000_50000",
							"object": "plan",
							"amount": 50000,
							"billing_scheme": "per_unit",
							"created": 1522966624,
							"currency": "gbp",
							"interval": "month",
							"interval_count": 1,
							"livemode": false,
							"metadata": {},
							"nickname": "350000_50000",
							"product": "prod_CEVM8P8BC74ifp",
							"tiers": null,
							"tiers_mode": null,
							"transform_usage": null,
							"trial_period_days": null,
							"usage_type": "licensed",
							"statement_descriptor": null,
							"name": "Learn to Code Course"
						},
						"quantity": 1,
						"subscription": "sub_CdHSJVXNFzHwzw"
					}
				],
				"has_more": false,
				"total_count": 1,
				"url": "/v1/subscription_items?subscription=sub_CdHSJVXNFzHwzw"
			},
			"livemode": false,
			"metadata": {},
			"plan": {
				"id": "350000_50000",
				"object": "plan",
				"amount": 50000,
				"billing_scheme": "per_unit",
				"created": 1522966624,
				"currency": "gbp",
				"interval": "month",
				"interval_count": 1,
				"livemode": false,
				"metadata": {},
				"nickname": "350000_50000",
				"product": "prod_CEVM8P8BC74ifp",
				"tiers": null,
				"tiers_mode": null,
				"transform_usage": null,
				"trial_period_days": null,
				"usage_type": "licensed",
				"statement_descriptor": null,
				"name": "Learn to Code Course"
			},
			"quantity": 1,
			"start": 1523045442,
			"status": "active",
			"tax_percent": null,
			"trial_end": null,
			"trial_start": null
		}
	],
	"has_more": false,
	"url": "/v1/subscriptions"
}