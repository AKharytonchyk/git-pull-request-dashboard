const reportWebVitals = () => {
  import("web-vitals/attribution").then(({ onCLS, onFCP, onLCP, onTTFB }) => {
    onCLS(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
  });
};

export default reportWebVitals;
