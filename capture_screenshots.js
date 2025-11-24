import puppeteer from 'puppeteer';
import fs from 'fs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport to a reasonable size
  await page.setViewport({ width: 1280, height: 720 });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    console.log('Page loaded');
    
    // Helper to change inputs
    const setInputValue = async (labelName, value) => {
      await page.evaluate((labelName, value) => {
        const labels = Array.from(document.querySelectorAll('label'));
        const label = labels.find(l => l.textContent.includes(labelName));
        if (label) {
          const input = label.parentElement.querySelector('input');
          if (input) {
            // Handle color inputs differently if needed, but value assignment works for both usually
            // For range inputs, we need to dispatch input event
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, value);
            
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
          }
        }
      }, labelName, value);
      await sleep(500); // Wait for particles to update/regenerate
    };

    // 1. Default
    await page.screenshot({ path: 'screenshots/1_default.png' });
    console.log('Captured 1_default.png');

    // 2. High Count
    await setInputValue('Particle Count', 40000);
    await page.screenshot({ path: 'screenshots/2_high_count.png' });
    console.log('Captured 2_high_count.png');

    // 3. Low Count
    await setInputValue('Particle Count', 2000);
    await page.screenshot({ path: 'screenshots/3_low_count.png' });
    console.log('Captured 3_low_count.png');

    // Reset Count
    await setInputValue('Particle Count', 10000);

    // 4. Large Size
    await setInputValue('Size', 3.0);
    await page.screenshot({ path: 'screenshots/4_large_size.png' });
    console.log('Captured 4_large_size.png');

    // 5. Small Size
    await setInputValue('Size', 0.2);
    await page.screenshot({ path: 'screenshots/5_small_size.png' });
    console.log('Captured 5_small_size.png');

    // Reset Size
    await setInputValue('Size', 0.5);

    // 6. High Speed
    await setInputValue('Speed', 4.0);
    await page.screenshot({ path: 'screenshots/6_high_speed.png' });
    console.log('Captured 6_high_speed.png');

    // Reset Speed
    await setInputValue('Speed', 1.0);

    // 7. Large Radius
    await setInputValue('Radius', 30);
    await page.screenshot({ path: 'screenshots/7_large_radius.png' });
    console.log('Captured 7_large_radius.png');

    // Reset Radius
    await setInputValue('Radius', 10);

    // 8. Color Red
    await setInputValue('Color', '#ff0000');
    await page.screenshot({ path: 'screenshots/8_color_red.png' });
    console.log('Captured 8_color_red.png');

    // 9. Color Blue
    await setInputValue('Color', '#0000ff');
    await page.screenshot({ path: 'screenshots/9_color_blue.png' });
    console.log('Captured 9_color_blue.png');

    // 10. Color Green
    await setInputValue('Color', '#00ff00');
    await page.screenshot({ path: 'screenshots/10_color_green.png' });
    console.log('Captured 10_color_green.png');

  } catch (e) {
    console.error('Error capturing screenshots:', e);
  } finally {
    await browser.close();
  }
})();
