# Hypothesis Testing Summary

## Business Question

Is there a statistically significant relationship between **customer segment** and **sales channel** for completed orders?

## Hypotheses

- Null hypothesis (H0): Customer segment and sales channel are independent.
- Alternative hypothesis (H1): Customer segment and sales channel are associated.

## Test Used

Chi-square test of independence.

This test is appropriate because both variables are categorical:

- Customer segment: Enterprise, Professional, Small Business, Student
- Sales channel: Online, Partner, Retail

## Significance Level

Alpha = 0.05

## Observed Completed Orders

| customer_segment | Online | Partner | Retail |
| --- | --- | --- | --- |
| Enterprise | 21 | 7 | 20 |
| Professional | 10 | 25 | 15 |
| Small Business | 14 | 17 | 23 |
| Student | 25 | 17 | 15 |

## Expected Counts

| customer_segment | Online | Partner | Retail |
| --- | --- | --- | --- |
| Enterprise | 16.08 | 15.16 | 16.77 |
| Professional | 16.75 | 15.79 | 17.46 |
| Small Business | 18.09 | 17.05 | 18.86 |
| Student | 19.09 | 18.00 | 19.91 |

## Test Result

| Metric | Value |
|---|---:|
| Chi-square statistic | 19.8872 |
| Degrees of freedom | 6 |
| p-value | 0.0029 |
| Alpha | 0.05 |
| Decision | Reject the null hypothesis |

## Business Conclusion

Customer segment and sales channel appear to be associated; channel strategy should be reviewed separately for each segment.

## Supporting Business Insights

### Customer Segment Revenue

| customer_segment | revenue | orders | avg_order_value |
| --- | --- | --- | --- |
| Small Business | Rs. 2,445,247.69 | 54 | Rs. 45,282.36 |
| Student | Rs. 1,907,198.42 | 57 | Rs. 33,459.62 |
| Enterprise | Rs. 1,762,736.49 | 48 | Rs. 36,723.68 |
| Professional | Rs. 1,697,999.72 | 50 | Rs. 33,959.99 |

### Sales Channel Revenue

| sales_channel | revenue | orders | avg_order_value |
| --- | --- | --- | --- |
| Retail | Rs. 2,808,826.05 | 73 | Rs. 38,477.07 |
| Online | Rs. 2,804,653.91 | 70 | Rs. 40,066.48 |
| Partner | Rs. 2,199,702.36 | 66 | Rs. 33,328.82 |

### Top Products by Revenue

| product | revenue | orders |
| --- | --- | --- |
| Laptop | Rs. 4,673,353.01 | 33 |
| Smartphone | Rs. 1,594,178.82 | 33 |
| Monitor | Rs. 1,159,674.01 | 41 |
| Headphones | Rs. 183,659.66 | 37 |
| Keyboard | Rs. 121,700.33 | 34 |
| Mouse | Rs. 80,616.49 | 31 |

## Recommendation

Use the dashboard and presentation findings to monitor segment-channel performance separately. Even when statistical evidence is limited, the revenue differences by segment and channel are business-relevant and should guide marketing, sales, and retention planning.
