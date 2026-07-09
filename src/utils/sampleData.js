/**
 * Sample datasets for premium pre-loaded experience.
 */
export const SAMPLE_DATASETS = {
  sales: {
    name: "Corporate Sales & Profit Analysis (2026)",
    description: "A detailed report of corporate sales transactions across global cities, tracking order items, revenues, and profits.",
    headers: [
      "Order ID", "Date", "Customer Name", "Segment", "City", "Country", 
      "Category", "Quantity", "Unit Price", "Sales Revenue", "Profit"
    ],
    rows: [
      { "Order ID": "ORD-1001", "Date": new Date("2026-01-12"), "Customer Name": "Sarah Jenkins", "Segment": "Corporate", "City": "New York", "Country": "United States", "Category": "Office Supplies", "Quantity": 5, "Unit Price": 12.50, "Sales Revenue": 62.50, "Profit": 18.75 },
      { "Order ID": "ORD-1002", "Date": new Date("2026-01-14"), "Customer Name": "Amit Patel", "Segment": "Consumer", "City": "London", "Country": "United Kingdom", "Category": "Technology", "Quantity": 2, "Unit Price": 450.00, "Sales Revenue": 900.00, "Profit": 270.00 },
      { "Order ID": "ORD-1003", "Date": new Date("2026-01-15"), "Customer Name": "Kenji Sato", "Segment": "Home Office", "City": "Tokyo", "Country": "Japan", "Category": "Furniture", "Quantity": 1, "Unit Price": 320.00, "Sales Revenue": 320.00, "Profit": 64.00 },
      { "Order ID": "ORD-1004", "Date": new Date("2026-01-18"), "Customer Name": "Elena Rostova", "Segment": "Corporate", "City": "Paris", "Country": "France", "Category": "Office Supplies", "Quantity": 12, "Unit Price": 4.99, "Sales Revenue": 59.88, "Profit": 17.96 },
      { "Order ID": "ORD-1005", "Date": new Date("2026-01-20"), "Customer Name": "Carlos Gomez", "Segment": "Consumer", "City": "Madrid", "Country": "Spain", "Category": "Technology", "Quantity": 3, "Unit Price": 199.99, "Sales Revenue": 599.97, "Profit": 149.99 },
      { "Order ID": "ORD-1006", "Date": new Date("2026-01-22"), "Customer Name": "David Miller", "Segment": "Corporate", "City": "Chicago", "Country": "United States", "Category": "Office Supplies", "Quantity": 8, "Unit Price": 15.00, "Sales Revenue": 120.00, "Profit": 36.00 },
      { "Order ID": "ORD-1007", "Date": new Date("2026-01-22"), "Customer Name": "David Miller", "Segment": "Corporate", "City": "Chicago", "Country": "United States", "Category": "Furniture", "Quantity": 2, "Unit Price": 250.00, "Sales Revenue": 500.00, "Profit": 75.00 },
      { "Order ID": "ORD-1008", "Date": new Date("2026-01-25"), "Customer Name": "Amelie Dubois", "Segment": "Consumer", "City": "Paris", "Country": "France", "Category": "Technology", "Quantity": 1, "Unit Price": 899.00, "Sales Revenue": 899.00, "Profit": 224.75 },
      { "Order ID": "ORD-1009", "Date": new Date("2026-02-01"), "Customer Name": "Marcus Aurelius", "Segment": "Corporate", "City": "Rome", "Country": "Italy", "Category": "Furniture", "Quantity": 4, "Unit Price": 150.00, "Sales Revenue": 600.00, "Profit": 180.00 },
      { "Order ID": "ORD-1010", "Date": new Date("2026-02-04"), "Customer Name": "Fatima Al-Sayed", "Segment": "Consumer", "City": "Dubai", "Country": "United Arab Emirates", "Category": "Technology", "Quantity": 5, "Unit Price": 120.00, "Sales Revenue": 600.00, "Profit": 150.00 },
      { "Order ID": "ORD-1011", "Date": new Date("2026-02-06"), "Customer Name": "John Doe", "Segment": "Consumer", "City": "New York", "Country": "United States", "Category": "Office Supplies", "Quantity": 10, "Unit Price": 8.00, "Sales Revenue": 80.00, "Profit": 24.00 },
      { "Order ID": "ORD-1012", "Date": new Date("2026-02-10"), "Customer Name": "Alice Smith", "Segment": "Corporate", "City": "London", "Country": "United Kingdom", "Category": "Office Supplies", "Quantity": 15, "Unit Price": 5.00, "Sales Revenue": 75.00, "Profit": 22.50 },
      { "Order ID": "ORD-1013", "Date": new Date("2026-02-11"), "Customer Name": "Bob Johnson", "Segment": "Home Office", "City": "Tokyo", "Country": "Japan", "Category": "Technology", "Quantity": 1, "Unit Price": 1100.00, "Sales Revenue": 1100.00, "Profit": 330.00 },
      { "Order ID": "ORD-1014", "Date": new Date("2026-02-15"), "Customer Name": "Li Wei", "Segment": "Consumer", "City": "Shanghai", "Country": "China", "Category": "Furniture", "Quantity": 2, "Unit Price": 400.00, "Sales Revenue": 800.00, "Profit": 160.00 },
      { "Order ID": "ORD-1015", "Date": new Date("2026-02-20"), "Customer Name": "Chloe Lemaire", "Segment": "Home Office", "City": "Paris", "Country": "France", "Category": "Office Supplies", "Quantity": 6, "Unit Price": 20.00, "Sales Revenue": 120.00, "Profit": 36.00 },
      { "Order ID": "ORD-1016", "Date": new Date("2026-02-22"), "Customer Name": "Sophia Brown", "Segment": "Consumer", "City": "New York", "Country": "United States", "Category": "Technology", "Quantity": 2, "Unit Price": 350.00, "Sales Revenue": 700.00, "Profit": 175.00 },
      { "Order ID": "ORD-1017", "Date": new Date("2026-02-25"), "Customer Name": "Lucas Muller", "Segment": "Corporate", "City": "Berlin", "Country": "Germany", "Category": "Furniture", "Quantity": 3, "Unit Price": 300.00, "Sales Revenue": 900.00, "Profit": 180.00 },
      { "Order ID": "ORD-1018", "Date": new Date("2026-02-28"), "Customer Name": "Isabella Silva", "Segment": "Consumer", "City": "Sao Paulo", "Country": "Brazil", "Category": "Office Supplies", "Quantity": 20, "Unit Price": 2.50, "Sales Revenue": 50.00, "Profit": 10.00 },
      { "Order ID": "ORD-1019", "Date": new Date("2026-03-01"), "Customer Name": "Jack Wilson", "Segment": "Corporate", "City": "Sydney", "Country": "Australia", "Category": "Technology", "Quantity": 1, "Unit Price": 750.00, "Sales Revenue": 750.00, "Profit": 150.00 },
      { "Order ID": "ORD-1020", "Date": new Date("2026-03-05"), "Customer Name": "Yuki Tanaka", "Segment": "Corporate", "City": "Tokyo", "Country": "Japan", "Category": "Office Supplies", "Quantity": 30, "Unit Price": 1.20, "Sales Revenue": 36.00, "Profit": 10.80 },
      { "Order ID": "ORD-1021", "Date": new Date("2026-03-08"), "Customer Name": "Emma Watson", "Segment": "Consumer", "City": "London", "Country": "United Kingdom", "Category": "Furniture", "Quantity": 1, "Unit Price": 500.00, "Sales Revenue": 500.00, "Profit": 100.00 },
      { "Order ID": "ORD-1022", "Date": new Date("2026-03-12"), "Customer Name": "Liam Neeson", "Segment": "Consumer", "City": "New York", "Country": "United States", "Category": "Furniture", "Quantity": 3, "Unit Price": 150.00, "Sales Revenue": 450.00, "Profit": 90.00 },
      { "Order ID": "ORD-1023", "Date": new Date("2026-03-15"), "Customer Name": "Oliver Kahn", "Segment": "Corporate", "City": "Munich", "Country": "Germany", "Category": "Office Supplies", "Quantity": 8, "Unit Price": 18.00, "Sales Revenue": 144.00, "Profit": 43.20 },
      { "Order ID": "ORD-1024", "Date": new Date("2026-03-18"), "Customer Name": "Ji-Yeon Kim", "Segment": "Home Office", "City": "Seoul", "Country": "South Korea", "Category": "Technology", "Quantity": 4, "Unit Price": 200.00, "Sales Revenue": 800.00, "Profit": 240.00 },
      { "Order ID": "ORD-1025", "Date": new Date("2026-03-20"), "Customer Name": "Santiago Cabrera", "Segment": "Consumer", "City": "Bogota", "Country": "Colombia", "Category": "Office Supplies", "Quantity": 10, "Unit Price": 6.50, "Sales Revenue": 65.00, "Profit": 19.50 }
    ]
  },
  hr: {
    name: "Employee Performance & Demographic Data",
    description: "HR metrics dashboard examining salary levels, performance metrics, and general gender/office locations of team members.",
    headers: [
      "Employee ID", "Full Name", "Department", "Gender", 
      "Office Location", "Country", "Monthly Salary", "Performance Score", "Engagement Score"
    ],
    rows: [
      { "Employee ID": "EMP-001", "Full Name": "Jane Doe", "Department": "Engineering", "Gender": "Female", "Office Location": "San Francisco", "Country": "United States", "Monthly Salary": 9500, "Performance Score": 4.5, "Engagement Score": 4.8 },
      { "Employee ID": "EMP-002", "Full Name": "John Smith", "Department": "Sales", "Gender": "Male", "Office Location": "New York", "Country": "United States", "Monthly Salary": 6200, "Performance Score": 3.8, "Engagement Score": 4.1 },
      { "Employee ID": "EMP-003", "Full Name": "Raj Patel", "Department": "Engineering", "Gender": "Male", "Office Location": "Bangalore", "Country": "India", "Monthly Salary": 4800, "Performance Score": 4.9, "Engagement Score": 4.7 },
      { "Employee ID": "EMP-004", "Full Name": "Chantal Dubois", "Department": "Marketing", "Gender": "Female", "Office Location": "Paris", "Country": "France", "Monthly Salary": 5800, "Performance Score": 4.2, "Engagement Score": 3.9 },
      { "Employee ID": "EMP-005", "Full Name": "Hans Schmidt", "Department": "HR", "Gender": "Male", "Office Location": "Berlin", "Country": "Germany", "Monthly Salary": 5200, "Performance Score": 3.5, "Engagement Score": 4.0 },
      { "Employee ID": "EMP-006", "Full Name": "Aiko Tanaka", "Department": "Engineering", "Gender": "Female", "Office Location": "Tokyo", "Country": "Japan", "Monthly Salary": 7800, "Performance Score": 4.6, "Engagement Score": 4.5 },
      { "Employee ID": "EMP-007", "Full Name": "Li Na", "Department": "Operations", "Gender": "Female", "Office Location": "Beijing", "Country": "China", "Monthly Salary": 5000, "Performance Score": 4.1, "Engagement Score": 4.3 },
      { "Employee ID": "EMP-008", "Full Name": "Arthur Pendragon", "Department": "Sales", "Gender": "Male", "Office Location": "London", "Country": "United Kingdom", "Monthly Salary": 6500, "Performance Score": 4.0, "Engagement Score": 3.8 },
      { "Employee ID": "EMP-009", "Full Name": "Sofia Silva", "Department": "Finance", "Gender": "Female", "Office Location": "Sao Paulo", "Country": "Brazil", "Monthly Salary": 4300, "Performance Score": 3.9, "Engagement Score": 4.2 },
      { "Employee ID": "EMP-010", "Full Name": "Nadia Boulanger", "Department": "Marketing", "Gender": "Female", "Office Location": "Paris", "Country": "France", "Monthly Salary": 6100, "Performance Score": 4.7, "Engagement Score": 4.6 },
      { "Employee ID": "EMP-011", "Full Name": "Peter Parker", "Department": "Engineering", "Gender": "Male", "Office Location": "New York", "Country": "United States", "Monthly Salary": 7200, "Performance Score": 4.3, "Engagement Score": 4.4 },
      { "Employee ID": "EMP-012", "Full Name": "Bruce Wayne", "Department": "Management", "Gender": "Male", "Office Location": "Chicago", "Country": "United States", "Monthly Salary": 25000, "Performance Score": 5.0, "Engagement Score": 5.0 }
    ]
  },
  realestate: {
    name: "Real Estate Property Listings",
    description: "Property listings for real estate analytics, tracking square footage, home types, price points, and status.",
    headers: [
      "Property ID", "Property Type", "Street Address", "City", "State", 
      "Zip Code", "Square Footage", "Bedrooms", "Bathrooms", "Price", "Status"
    ],
    rows: [
      { "Property ID": "PROP-201", "Property Type": "Single Family", "Street Address": "123 Elm St", "City": "Denver", "State": "CO", "Zip Code": "80202", "Square Footage": 2100, "Bedrooms": 3, "Bathrooms": 2.5, "Price": 485000, "Status": "Active" },
      { "Property ID": "PROP-202", "Property Type": "Condo", "Street Address": "456 Oak Ave Apt 4B", "City": "Seattle", "State": "WA", "Zip Code": "98101", "Square Footage": 950, "Bedrooms": 1, "Bathrooms": 1.0, "Price": 320000, "Status": "Sold" },
      { "Property ID": "PROP-203", "Property Type": "Townhouse", "Street Address": "789 Pine Rd", "City": "Boston", "State": "MA", "Zip Code": "02108", "Square Footage": 1600, "Bedrooms": 2, "Bathrooms": 2.0, "Price": 599000, "Status": "Pending" },
      { "Property ID": "PROP-204", "Property Type": "Single Family", "Street Address": "321 Maple Dr", "City": "Austin", "State": "TX", "Zip Code": "78701", "Square Footage": 3100, "Bedrooms": 4, "Bathrooms": 3.5, "Price": 725000, "Status": "Active" },
      { "Property ID": "PROP-205", "Property Type": "Condo", "Street Address": "555 Cedar St #12", "City": "Miami", "State": "FL", "Zip Code": "33101", "Square Footage": 1200, "Bedrooms": 2, "Bathrooms": 2.0, "Price": 450000, "Status": "Sold" },
      { "Property ID": "PROP-206", "Property Type": "Single Family", "Street Address": "888 Birch Ln", "City": "Denver", "State": "CO", "Zip Code": "80209", "Square Footage": 2800, "Bedrooms": 4, "Bathrooms": 3.0, "Price": 670000, "Status": "Active" },
      { "Property ID": "PROP-207", "Property Type": "Townhouse", "Street Address": "432 Walnut St", "City": "Boston", "State": "MA", "Zip Code": "02111", "Square Footage": 1450, "Bedrooms": 2, "Bathrooms": 1.5, "Price": 510000, "Status": "Sold" },
      { "Property ID": "PROP-208", "Property Type": "Single Family", "Street Address": "101 Redwood Ct", "City": "San Francisco", "State": "CA", "Zip Code": "94102", "Square Footage": 2400, "Bedrooms": 3, "Bathrooms": 2.5, "Price": 1250000, "Status": "Pending" }
    ]
  }
};
