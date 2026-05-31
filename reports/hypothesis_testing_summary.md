# Task 4 - Data Storytelling & Statistical Validation

## Business Story
The business is growing through digital channels, with Website and Mobile App responsible for most sales. The opportunity is not just to increase traffic, but to protect profitable growth by improving category-level return behavior and doubling down on high-value customer segments.

## Hypothesis
**H0:** The share of high-satisfaction orders, defined as rating 4 or 5, is the same for Website and Mobile App orders.

**H1:** Mobile App orders have a different high-satisfaction rate than Website orders.

## Test Used
To provide a robust validation of customer rating behavior across digital channels, three statistical tests were executed in Python (`scripts/hypothesis_testing.py`):
1. **Two-Proportion Z-Test**: To compare the proportion of high-satisfaction orders (ratings $\ge$ 4) between Website and Mobile App.
2. **Chi-Squared Test of Independence**: To verify if satisfaction category (High vs Low) is independent of the sales channel.
3. **Welch's T-Test**: To compare the average (mean) raw ratings between Website and Mobile App orders (allowing for unequal variances).

## Results
Below are the statistical results calculated directly from the clean dataset containing 592 Website ratings and 456 Mobile App ratings:

### 1. Two-Proportion Z-Test (Satisfaction Rate Comparison)
* **H0**: The proportion of high-satisfaction orders is the same for Website and Mobile App.
* **H1**: The proportion of high-satisfaction orders differs between Website and Mobile App.

| Measure | Value |
|---|---:|
| Website high-satisfaction rate | 68.92% (408/592) |
| Mobile App high-satisfaction rate | 70.61% (322/456) |
| Z-statistic | -0.5918 |
| P-value | 0.5540 |
| 95% Confidence Interval for difference (App - Web) | -3.91% to 7.30% |

### 2. Chi-Squared Test of Independence
* **H0**: Customer satisfaction class (high vs low) is independent of the sales channel.
* **H1**: Customer satisfaction class is associated with the sales channel.

| Measure | Value |
|---|---:|
| Chi-square statistic | 0.2746 |
| P-value | 0.6003 |
| Degrees of Freedom | 1 |

### 3. Welch's T-Test (Average Rating Comparison)
* **H0**: The average customer rating is the same for Website and Mobile App orders.
* **H1**: The average customer rating differs between Website and Mobile App orders.

| Measure | Value |
|---|---:|
| Website average rating | 3.8024 |
| Mobile App average rating | 3.8596 |
| T-statistic | -0.8650 |
| P-value | 0.3873 |

## Conclusion
At the 5% significance level, all tests show that the differences in customer satisfaction and customer ratings between the Website and Mobile App channels are **not statistically significant** ($p > 0.05$):
- The $p$-value for the Z-test is $0.5540$ (fail to reject $H_0$).
- The $p$-value for the Chi-square test is $0.6003$ (fail to reject $H_0$).
- The $p$-value for Welch's T-test is $0.3873$ (fail to reject $H_0$).

**Interpretation:** The business should monitor the minor lead in Mobile App ratings and satisfaction, but should not make significant strategic changes or over-claim channel superiority based on this difference, as it can be attributed to random sampling variation. Both digital channels remain critical and deserve continued investment.

## Call to Action
1. **Increase retention campaigns** for the strongest digital customer segments across both platforms.
2. **Improve product pages and expectation setting** for product categories with higher returns to drive up satisfaction.
3. **Track return rate and customer rating together** in a unified performance dashboard, preventing growth metrics from hiding underlying experience issues.

