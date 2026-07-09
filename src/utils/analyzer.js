/**
 * Generates descriptive statistics for all columns in the dataset.
 */
export const calculateDatasetStats = (headers, rows, columnTypes) => {
  const totalRecords = rows.length;
  const totalColumns = headers.length;
  let totalMissingCount = 0;
  let totalCells = totalRecords * totalColumns;

  const columnStats = {};

  headers.forEach(header => {
    const type = columnTypes[header] || 'text';
    const values = rows.map(r => r[header]).filter(v => v !== null && v !== undefined && v !== '');
    const missingCount = totalRecords - values.length;
    totalMissingCount += missingCount;

    const uniqueValues = new Set(values);
    const uniqueCount = uniqueValues.size;

    const stat = {
      header,
      type,
      missingCount,
      missingPct: totalRecords > 0 ? (missingCount / totalRecords) * 100 : 0,
      uniqueCount,
      count: values.length,
    };

    if (type === 'number') {
      const numValues = values.map(v => {
        if (typeof v === 'number') return v;
        const cleanVal = String(v).replace(/[\$,%]/g, '');
        return Number(cleanVal);
      }).filter(v => !isNaN(v));

      if (numValues.length > 0) {
        numValues.sort((a, b) => a - b);
        const sum = numValues.reduce((acc, val) => acc + val, 0);
        const avg = sum / numValues.length;
        const min = numValues[0];
        const max = numValues[numValues.length - 1];
        const range = max - min;
        
        // Median
        const mid = Math.floor(numValues.length / 2);
        const median = numValues.length % 2 !== 0 ? numValues[mid] : (numValues[mid - 1] + numValues[mid]) / 2;

        stat.sum = sum;
        stat.avg = avg;
        stat.min = min;
        stat.max = max;
        stat.range = range;
        stat.median = median;
      }
    } else if (type === 'category' || type === 'location' || type === 'text') {
      // Frequency distribution
      const freqs = {};
      values.forEach(v => {
        const strVal = String(v).trim();
        freqs[strVal] = (freqs[strVal] || 0) + 1;
      });

      const sortedFreqs = Object.entries(freqs)
        .map(([value, count]) => ({ value, count, pct: (count / values.length) * 100 }))
        .sort((a, b) => b.count - a.count);

      stat.frequencies = sortedFreqs;
      stat.topValue = sortedFreqs[0]?.value || 'N/A';
      stat.topValuePct = sortedFreqs[0]?.pct || 0;
    } else if (type === 'date') {
      const dates = values.map(v => {
        if (v instanceof Date) return v;
        return new Date(v);
      }).filter(d => !isNaN(d.getTime()));

      if (dates.length > 0) {
        dates.sort((a, b) => a - b);
        stat.min = dates[0];
        stat.max = dates[dates.length - 1];
        stat.spanDays = Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24));
      }
    }

    columnStats[header] = stat;
  });

  const missingPct = totalCells > 0 ? (totalMissingCount / totalCells) * 100 : 0;
  const dataQualityScore = Math.max(0, 100 - missingPct);

  return {
    summary: {
      totalRecords,
      totalColumns,
      totalMissingCount,
      missingPct,
      dataQualityScore,
    },
    columnStats,
  };
};

/**
 * Specifically aggregates location data for any location-based column.
 */
export const aggregateLocationStats = (headers, rows, columnTypes, activeColumn) => {
  // Find location columns
  const locationColumns = headers.filter(h => columnTypes[h] === 'location');
  if (locationColumns.length === 0) return null;

  // Use the selected active location column or fall back to the first one
  const targetCol = locationColumns.includes(activeColumn) ? activeColumn : locationColumns[0];
  
  const values = rows.map(r => r[targetCol]).filter(v => v !== null && v !== undefined && v !== '');
  const freqs = {};
  
  values.forEach(v => {
    const valStr = String(v).trim();
    freqs[valStr] = (freqs[valStr] || 0) + 1;
  });

  const totalLocRecords = values.length;
  const distributions = Object.entries(freqs)
    .map(([location, count]) => ({
      name: location,
      value: count,
      percentage: totalLocRecords > 0 ? ((count / totalLocRecords) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.value - a.value);

  const top10 = distributions.slice(0, 10);
  const othersCount = distributions.slice(10).reduce((acc, curr) => acc + curr.value, 0);
  
  if (othersCount > 0 && distributions.length > 10) {
    top10.push({
      name: 'Other Locations',
      value: othersCount,
      percentage: totalLocRecords > 0 ? ((othersCount / totalLocRecords) * 100).toFixed(1) : 0
    });
  }

  return {
    columnName: targetCol,
    allLocations: locationColumns,
    totalCount: totalLocRecords,
    uniqueCount: Object.keys(freqs).length,
    top10,
    fullDistribution: distributions
  };
};

/**
 * Automatically creates list of qualitative natural language AI insights.
 */
export const generateAiInsights = (headers, rows, columnTypes, stats) => {
  const insights = [];
  const { summary, columnStats } = stats;

  // Insight 1: Data Integrity / Records Volume
  insights.push({
    type: 'info',
    title: 'Dataset Volume & Coverage',
    description: `Analyzed ${summary.totalRecords.toLocaleString()} rows and ${summary.totalColumns} columns. The dataset shows a ${summary.dataQualityScore.toFixed(1)}% completeness score (only ${summary.missingPct.toFixed(1)}% of fields are missing/null).`
  });

  // Highlight missing values if they are notable
  const highlyMissingCols = Object.values(columnStats).filter(c => c.missingPct > 20);
  if (highlyMissingCols.length > 0) {
    const names = highlyMissingCols.map(c => `"${c.header}" (${c.missingPct.toFixed(0)}% missing)`).join(', ');
    insights.push({
      type: 'warning',
      title: 'Data Sparsity / Missing Values',
      description: `Columns: ${names} contain more than 20% empty values. Calculations using these columns may be skewed due to missing entries.`
    });
  }

  // Insight 2: Numeric Peaks and averages
  const numericCols = Object.values(columnStats).filter(c => c.type === 'number');
  numericCols.forEach(col => {
    if (col.avg !== undefined) {
      insights.push({
        type: 'success',
        title: `Metric Analysis: ${col.header}`,
        description: `"${col.header}" ranges from ${col.min.toLocaleString()} to ${col.max.toLocaleString()} (average of ${col.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}). The total accumulated sum is ${col.sum.toLocaleString()}.`
      });
    }
  });

  // Insight 3: Category Cardinality / Dominant Classes
  const catCols = Object.values(columnStats).filter(c => c.type === 'category' || c.type === 'location');
  catCols.slice(0, 3).forEach(col => {
    if (col.topValue && col.topValuePct > 0) {
      insights.push({
        type: 'info',
        title: `Dominant Category in ${col.header}`,
        description: `For the "${col.header}" category, "${col.topValue}" is the most frequent item, appearing ${col.topValuePct.toFixed(1)}% of the time (${col.frequencies[0].count} times). There are ${col.uniqueCount} unique categories in total.`
      });
    }
  });

  // Insight 4: Temporal Spans
  const dateCols = Object.values(columnStats).filter(c => c.type === 'date');
  dateCols.forEach(col => {
    if (col.min && col.max) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const startStr = col.min.toLocaleDateString(undefined, options);
      const endStr = col.max.toLocaleDateString(undefined, options);
      insights.push({
        type: 'info',
        title: `Temporal Coverage: ${col.header}`,
        description: `Chronological data in "${col.header}" covers a duration of ${col.spanDays} days, starting from ${startStr} and extending to ${endStr}.`
      });
    }
  });

  // Insight 5: Auto-detected Locations
  const locationCols = Object.values(columnStats).filter(c => c.type === 'location');
  if (locationCols.length > 0) {
    const locNames = locationCols.map(c => `"${c.header}"`).join(', ');
    insights.push({
      type: 'success',
      title: 'Geographical Dimensions Found',
      description: `Automatically identified location fields: ${locNames}. You can view the Top Locations tab to inspect maps, tables, and distribution charts of your geographic footprints.`
    });
  }

  return insights;
};
