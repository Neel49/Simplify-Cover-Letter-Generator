const style = document.createElement('style');
style.innerHTML = `
  #generate-button {
    background-color: white;
    position: fixed;
    bottom: 85px;
    right: 5px;
    width: 120px;
    height: 30px;
    padding: 6px 14px;
    box-sizing: border-box;
    font-family: "Untitled Sans";
    color: black;
    border: 1px solid lightgray;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.1);
    z-index: 9999;
  }

  #generate-button:hover {
    box-shadow: inset 100px 100px rgba(0,0,0,0.05);
  }

  #generate-button:disabled {
    box-shadow: inset 100px 100px rgba(0,0,0,0.05);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  #spinner {
    border: 1.5px solid rgba(255, 255, 255, 0.3);
    border-top: 1.5px solid black;
    border-left: 1.5px solid black;
    border-right: 1.5px solid black;

    border-radius: 50%; 
    width: 12px;
    height: 12px;

    animation: spin 1s linear infinite;
    top: 50%;
    left: 50%;
    margin: auto;

    display: none;
  }
`;

export { style };

