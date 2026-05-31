import os
import pandas as pd
import numpy as np
from scipy import stats

def run_hypothesis_tests():
    # Define file paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "..", "data", "sales_transactions_cleaned.csv")
    
    if not os.path.exists(data_path):
        print(f"Error: Cleaned sales transactions data file not found at {data_path}")
        return
        
    df = pd.read_csv(data_path)
    print("======================================================================")
    print("           TASK 4: STATISTICAL HYPOTHESIS TESTING REPORT              ")
    print("======================================================================")
    
    # 1. Inspect data and filter
    print(f"Total sales records loaded: {len(df)}")
    
    web_ratings = df[df['sales_channel'] == 'Website']['customer_rating'].dropna()
    app_ratings = df[df['sales_channel'] == 'Mobile App']['customer_rating'].dropna()
    
    n_web = len(web_ratings)
    n_app = len(app_ratings)
    
    print(f"Website Channel rating observations: {n_web}")
    print(f"Mobile App Channel rating observations: {n_app}")
    
    mean_web = web_ratings.mean()
    mean_app = app_ratings.mean()
    print(f"Website average rating: {mean_web:.4f}")
    print(f"Mobile App average rating: {mean_app:.4f}")
    
    # 2. Welch's T-Test (comparing average ratings)
    print("\n----------------------------------------------------------------------")
    print("1. Welch's T-Test (Comparing Rating Means)")
    print("H0: The average customer rating is the same for Website and Mobile App orders.")
    print("H1: The average customer rating differs between Website and Mobile App orders.")
    
    t_stat, t_pval = stats.ttest_ind(web_ratings, app_ratings, equal_var=False)
    print(f"T-statistic: {t_stat:.4f}")
    print(f"P-value: {t_pval:.4f}")
    if t_pval < 0.05:
        print("Conclusion: Reject H0 at 5% significance level. There is a statistically significant difference in mean customer ratings.")
    else:
        print("Conclusion: Fail to reject H0 at 5% significance level. There is no statistically significant difference in mean customer ratings.")
        
    # 3. Two-proportion Z-Test (Comparing High Satisfaction rate: ratings >= 4)
    print("\n----------------------------------------------------------------------")
    print("2. Two-Proportion Z-Test (Comparing Proportion of High-Satisfaction, Rating >= 4)")
    print("H0: The proportion of high-satisfaction orders is the same for Website and Mobile App.")
    print("H1: The proportion of high-satisfaction orders differs between Website and Mobile App.")
    
    web_high = (web_ratings >= 4).sum()
    app_high = (app_ratings >= 4).sum()
    
    p1 = web_high / n_web
    p2 = app_high / n_app
    
    p_combined = (web_high + app_high) / (n_web + n_app)
    z_stat = (p1 - p2) / np.sqrt(p_combined * (1 - p_combined) * (1/n_web + 1/n_app))
    # Two-tailed p-value
    p_val_z = 2 * (1 - stats.norm.cdf(abs(z_stat)))
    
    # Confidence Interval for difference p2 - p1 (Mobile App - Website)
    diff = p2 - p1
    se_diff = np.sqrt(p1*(1-p1)/n_web + p2*(1-p2)/n_app)
    margin_error = 1.96 * se_diff
    ci_lower = diff - margin_error
    ci_upper = diff + margin_error
    
    print(f"Website High-Satisfaction: {web_high}/{n_web} ({p1*100:.2f}%)")
    print(f"Mobile App High-Satisfaction: {app_high}/{n_app} ({p2*100:.2f}%)")
    print(f"Z-statistic: {z_stat:.4f}")
    print(f"P-value: {p_val_z:.4f}")
    print(f"Difference in Proportions (App - Website): {diff*100:.2f}%")
    print(f"95% Confidence Interval for difference: {ci_lower*100:.2f}% to {ci_upper*100:.2f}%")
    if p_val_z < 0.05:
        print("Conclusion: Reject H0 at 5% significance level. The difference in satisfaction rates is statistically significant.")
    else:
        print("Conclusion: Fail to reject H0 at 5% significance level. The difference in satisfaction rates is not statistically significant.")

    # 4. Chi-Squared Test of Independence (Comparing rating distributions >= 4 vs < 4)
    print("\n----------------------------------------------------------------------")
    print("3. Chi-Squared Test of Independence (Satisfaction category vs Sales Channel)")
    print("H0: Customer satisfaction class (high vs low) is independent of the sales channel.")
    print("H1: Customer satisfaction class is associated with the sales channel.")
    
    contingency = [
        [web_high, n_web - web_high],
        [app_high, n_app - app_high]
    ]
    chi2, p_val_chi2, dof, expected = stats.chi2_contingency(contingency)
    print(f"Chi-square statistic: {chi2:.4f}")
    print(f"P-value: {p_val_chi2:.4f}")
    print(f"Degrees of freedom: {dof}")
    print("Contingency table (High Sat, Low Sat):")
    print(f"  Website:    {contingency[0]}")
    print(f"  Mobile App: {contingency[1]}")
    if p_val_chi2 < 0.05:
        print("Conclusion: Reject H0 at 5% significance level. Satisfaction and Channel are dependent.")
    else:
        print("Conclusion: Fail to reject H0 at 5% significance level. Satisfaction and Channel are independent.")
    print("======================================================================")

if __name__ == "__main__":
    run_hypothesis_tests()
