import React, { useEffect, useState } from "react";

const Preloader: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    const img = new Image();
    img.src = "/preloader.gif";  
    img.onload = () => setLoading(false);

    
    const timer = setTimeout(() => setLoading(false), 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center ">
        <img src="/Preloader.gif" alt="Loading..." className="w-1/2 h-1/2 animate-pulse" />
      </div>
    );
  }
 
  return null; 
};

export default Preloader;
