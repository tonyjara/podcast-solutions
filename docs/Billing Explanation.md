# Billing Explanation

Billing is tied to stripe and is meant to have an accurate representation of the data that stripe has about usage.
However usage records should only be only sent to stripe when a user has ran out of credits. Credits get added to a user according to their plan. Free users get no added credits.

When a user signs up for a plan a subscription is created. With the subscription come the subscription items. This are related to the products and prices and are used to send usage records to stripe.

PS id's are the same as stripe's ids
