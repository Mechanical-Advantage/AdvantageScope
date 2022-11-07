# 📊 Statistics

_[< Return to homepage](/docs/INDEX.md)_

The statistics tab allows for deep statistical analysis of numerical fields, analyzing overall trends rather than changes over time. The selected fields are analyzed using a histogram and a variety of standard statistical measures. The key sections of the tab are shown here:

![Overview of statistics tab](/docs/resources/statistics/statistics-1.png)

## Configuration

The <span style="color: red;">configuration (red)</span> section contains the displayed fields and the settings used during analysis. To add a field, drag it to one of the labeled boxes. To remove a field, right-click the box. All of the analysis settings are liste below.

### Selection

- **Selection Type:** Sets the time range(s) to anlyze. See options below.
  - _Full Log:_ Analyzes the full range of the log file.
  - _Enabled Only:_ Analyzes time ranges where the robot is enabled.
  - _Time Range:_ Analyzes a custom time range.
- **Range:** If _Time Range_ is selected, defines the range to analyze in seconds.

### Measurement

- **Measurement Type:** Sets how the fields are interpreted. See options below.
  - _Independent fields:_ Analyzes up to three fields separately (including the histogram and statistical measures).
  - _Relative error:_ Analyzes up to two measurement fields relative to a reference field. At each timestamp, the values of the fields are equal to "measurement - reference".
  - _Absolute error:_ Analyzes up to two measurements fields relative to a reference field, but taking the absolute value of the error. At each timestamp, the values of the fields are equal to "abs(measurement - reference)"
- **Sampling:** Sets how discrete samples are captured from timestamped data. See options below.
  - _Fixed:_ Generates discrete samples at a constant time interval (recommended in most cases). Set the sampling period to adjust how often samples are generated; this should generally equal the period of the robot controller.
  - _Auto:_ Generates discrete samples whenever any field is updated, producing one sample for each loop cycle. This option should only be used on timestamp synchronized logs, like those produced by AdvantageKit.

### Histogram

- **Range:** The min and max values to display on the histogram. Data outside this range is not shown, but it continues to be used for the statistical measures.
- **Step:** The size of each histogram bin. Smaller values produce more detailed graphs, but also reveal more noise.

## Statistical Measures

The table of <span style="color: blue;">statistical measures (blue)</span> shows the calculated values of each measure for the provided fields. Discrete samples are generated using the configured selection and sampling mode, then analyzed. More information on each measure is provided below.

### Summary

- **Count:** The number of discrete samples generated.
- **Min:** The smallest value in the data.
- **Max:** The largest value in the data.

### Center

- [**Mean:**](https://en.wikipedia.org/wiki/Arithmetic_mean) The arithmetic mean (simple average) of the data.
- [**Median:**](https://en.wikipedia.org/wiki/Median) The "middle" value of the data, or the 50% percentile.
- [**Mode:**](<https://en.wikipedia.org/wiki/Mode_(statistics)>) The most common value in the data.
- [**Geometric Mean:**](https://en.wikipedia.org/wiki/Geometric_mean) A measure of center calculated using the product of the values rather than the sum. Applicable when measuring _exponential growth rates_ (like percent change between cycles).
- [**Harmonic Mean:**](https://en.wikipedia.org/wiki/Harmonic_mean) A measure of center calculated using the sum of the reciprocals of the values. Applicable when measuring _rates or velocities_.
- [**Quadratic Mean:**](https://en.wikipedia.org/wiki/Root_mean_square) A measure of center calculated using the squares of the values. Applicable when measuring data with both _positive and negative values_, like periodic motion.

### Spread

- [**Standard Deviation:**](https://en.wikipedia.org/wiki/Standard_deviation) The most common statistical measure of variation, where a lower value indicates less variation. 68% of the data falls within one standard deviation of the mean.
- [**Mean Absolute Deviation:**](https://en.wikipedia.org/wiki/Average_absolute_deviation) The average distance between each value and the mean. This is an alternative to the standard deviation.
- [**Interquartile Range:**](https://en.wikipedia.org/wiki/Interquartile_range) The difference between the third and first quartiles (75th percentile and 25th percentile), less affected by outliers than the standard deviation or mean absolute deviation.
- [**Skewness:**](https://en.wikipedia.org/wiki/Skewness) A measure of the asymmetric skew of the data. A negative value indicates a tail to the left, a positive value indicates a tail to the right, and a zero value suggests a symmetric distribution.

### Percentiles

The [percentiles](https://en.wikipedia.org/wiki/Percentile) measure values below which the given percentage of other values fall. For example, 10% of values fall below the 10th percentile. The following percentiles are also known as:

- 25th Percentile = 1st quartile (Q1)
- 50th Percentile = 2nd quartile (Q2) = median
- 75th Percentile = 3rd quartile (Q3)

## Histogram

The <span style="color: green;">histogram (green)</span> shows the number of samples that fall in each bin, within the specific range. Note that data outside the specified range is discarded (rather than being grouped into a separate bin). For more information about how to interpret a histogram, see [this video](https://youtu.be/c02vjunQsJM).
