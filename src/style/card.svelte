<!-- Card.svelte -->
<style>
    .card {
      background-color: orange;
      border: .5px solid black;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px; 
      text-align: center;
      font-size: 8px;
      height: 95%;  
      width: 100%;  
      box-sizing: border-box; 
    }
  </style>
  
  <div class="card">
    <slot></slot>
  </div>
  