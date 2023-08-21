# Billing Explanation

This explanation is meant to clarify how the data schema works with the business logic.

There are 2 types of products, **Subscription plants** and **Measured_Products**.
The first one are the flat rates customers pay on a monthly/yearly rate.It includes a set amount of benefits, for example, the basic plan includes 500.000 input chat tokens.

The second one is a pay as you go product, everytime a billable action is executed, the quantity of the usage is stored. For example, when transcribing, the minutes used would be stored.
