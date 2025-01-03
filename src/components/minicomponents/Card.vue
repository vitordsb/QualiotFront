<template>
    <div class="card">
      <div class="card-icon">
        <img :src="img" alt="Icone Card 3">
      </div>
      <div class="card-content">
        <h3>{{ title }}</h3>
        <p class="value">{{ totalSales }}</p>
        <p class="description">{{ description }}</p>
      </div>
    </div>
</template>
<script setup>

const props = defineProps({
    title: String,
    img: String,
    totalSales: String,
    description: String
})


</script>
<style scoped>
.card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 390px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-icon img {
  width: 150px;
  height: 150px;
}

.card-content {
  p {
    text-align: center;
  }
}

.card h3 {
  font-size: 1.5rem;
  font-weight: bolder;
  color: #333;
  margin: 0;
}

.card .value {
  font-size: 2rem;
  font-weight: bold;
  color: #1ca803;
  margin: 5px 0;
}

.card .description {
  font-size: 0.9rem;
  color: #666;
}
.card-two {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 20px;
  width: auto;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card-two:hover {
  transform: translateY(-5px);
  box-shadow: 8px 6px 12px rgba(0, 0, 0, 0.15);
}

.card-icon-two img {
  width: 250px;
  height: 250px;
}

.card-content-two {
  p {
    text-align: center;
  }
}

.card-two h3 {
  font-size: 1.5rem;
  font-weight: bolder;
  color: #333;
  margin: 0;
} 

.card-two .value-two {
  font-size: 2rem;
  font-weight: bold;
  color: #1ca803;
  margin: 5px 0;
}

.card-two .description-two {
  font-size: 0.9rem;
  color: #666;
}

</style>