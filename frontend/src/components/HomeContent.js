import React from "react";

const HomeContent = () => {
  return (
    <div className="home-content">
      <h1>Welcome to GreenVerse AR/VR Hub</h1>
      <p>Empowering sustainability through AR/VR technology. Scan objects to learn about their environmental impact.</p>
      <h2>Interesting Sustainability Facts for 2025</h2>
      <ul>
        <li>72% of global consumers are willing to pay more for sustainable products. (NielsenIQ)</li>
        <li>34% of global consumers are more likely to buy products with sustainable packaging.</li>
        <li>A comprehensive circular economy approach can reduce the annual volume of plastics entering the ocean by 80% and GHG emissions by 25%.</li>
        <li>76% of consumers would cease buying from firms that neglect environmental, employee, or community well-being.</li>
        <li>It takes more energy to make 1 kg of paper than it takes to make 1 kg of steel.</li>
        <li>Global recycling rate is 20%, with a goal to increase to 50% by 2030.</li>
      </ul>
      <p>Start scanning with Live Camera to contribute to a greener planet!</p>
    </div>
  );
};

export default HomeContent;