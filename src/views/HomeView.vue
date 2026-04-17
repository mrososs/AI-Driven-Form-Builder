<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue'
import Footer from '../components/layout/Footer.vue'
import HeroSection from '../components/home/HeroSection.vue'
import FrameworkSupport from '../components/home/FrameworkSupport.vue'
import FeatureCards from '../components/home/FeatureCards.vue'
</script>

<template>
  <div class="relative min-h-screen antialiased bg-white dark:bg-[#08080f] flex flex-col">

    <!--
      Grid pattern is isolated to its own childless element.
      mask-image on a container clips ALL descendants — putting it here
      means the mask only affects this div's background, not page content.
    -->
    <div class="absolute inset-0 bg-grid-pattern pointer-events-none" aria-hidden="true"></div>

    <Navbar />

    <main class="relative z-10 flex flex-col items-center w-full flex-1">
      <HeroSection />
      <FrameworkSupport />
      <FeatureCards />
    </main>

    <Footer />
  </div>
</template>
