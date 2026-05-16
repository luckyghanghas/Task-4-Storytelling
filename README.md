# Task 4: Data Storytelling & Statistical Validation

This repository contains the Task 4 submission for the 60-day Data Analytics internship.

## Objective

Synthesize the analysis into a business narrative and validate a key finding using a statistical hypothesis test.

## Deliverables

- Final presentation deck: `presentation/final_presentation_deck.pptx`
- Hypothesis testing summary: `reports/hypothesis_testing_summary.md`

## Hypothesis Test

Business question:

Is there a statistically significant relationship between customer segment and sales channel for completed orders?

Test used:

Chi-square test of independence.

Result:

- Chi-square statistic: `19.8872`
- Degrees of freedom: `6`
- p-value: `0.0029`
- Decision: Reject the null hypothesis

## Business Conclusion

Customer segment and sales channel appear to be associated. Channel strategy should be reviewed separately for each customer segment instead of using only overall channel averages.

## Key Presentation Story

The presentation explains the sales performance story, highlights key KPIs, validates the segment-channel relationship statistically, and gives business recommendations for segment-specific sales and marketing decisions.
