let heroImage = document.querySelector(".hero-img");
let heroH1 = document.querySelector(".hero_h1");
let heroH1Span = document.querySelector(".hero_h1_span");
let heroImageText = document.querySelector(".img_text");
let buttons = [...document.querySelectorAll(".hero_buttons_but")];

const auto = true;
const inter = 15000;
let slideIntNext;

let butHandler = (e) => {
  // console.log(e.target);
  buttons.forEach((b) => {
    if (e.target == b) {
      b.classList.add("cur");

      heroImage.src = `./images/hero_${b.dataset.image}.png`;
    } else {
      b.classList.remove("cur");
    }
  });
  if (auto) {
    clearInterval(slideIntNext);
    slideIntNext = setInterval(nextSlide, inter);
  }
};

const nextSlide = () => {
  let current = document.querySelector(".cur");
  current.classList.remove("cur");
  let nextImg = current.nextElementSibling;
  if (nextImg) {
    nextImg.classList.add("cur");
    heroImage.src = `./images/hero_${nextImg.dataset.image}.png`;
  } else {
    buttons[0].classList.add("cur");
    heroImage.src = `./images/hero_${buttons[0].dataset.image}.png`;
  }
};

if (auto) {
  clearInterval(slideIntNext);
  slideIntNext = setInterval(nextSlide, inter);
}

buttons.map((b) => b.addEventListener("click", butHandler));

// COLLECTIONS

const containerMass = 5;
const mouseMass = 10;

let imageHasLoaded = false;

let mouseX = 0;
let prevMouseX = 0;
let mouseXOnDown = null;
let isMouseDown = false;

let containerPosition = 0;
let mouseVelocity = 0;
let containerVelocity = 0;

let imagesElement = null;

const checkImagesHasLoaded = (images) => {
  const allImagePromises = images.map((image) => {
    return new Promise((resolve) => {
      resolve(image);
    });
  });

  return Promise.all(allImagePromises);
};

const createBeltScroller = (container, images) => {
  checkImagesHasLoaded(images).then((resolvedImages) => {
    imageHasLoaded = true;
    const beltDOMItems = images.map((image, index) => {
      const element = document.createElement("div");
      element.classList.add("collections_content_item");
      element.style.transform = `matrix(1, 0, 0, 1, 0, 0)`;
      element.style.height = `${
        (36 * resolvedImages[index].naturalHeight) /
        resolvedImages[index].naturalWidth
      }vw`;
      element.appendChild(image);
      return element;
    });
    imagesElement = beltDOMItems.map((element) => element);
    beltDOMItems.forEach((beltDOMItem) => {
      container.appendChild(beltDOMItem);
    });
  });
};

const container = document.querySelector(".collections_content");
let items = [...document.querySelectorAll(".item_card")];
// console.log(items);
createBeltScroller(container, items);

const onMouseUpdate = (event) => {
  mouseX = event.pageX;
};

const onMouseDown = () => {
  isMouseDown = true;
};

const onMouseUp = () => {
  isMouseDown = false;
};

document.addEventListener("mousemove", onMouseUpdate, false);

document.addEventListener("mousedown", onMouseDown);

document.addEventListener("mouseup", onMouseUp);

const calculateMouseMomentum = () => {
  if (isMouseDown) {
    if (mouseXOnDown == null) {
      mouseXOnDown = mouseX;
      containerVelocity = 0;
    }

    const distance = mouseX - mouseXOnDown;

    mouseVelocity = mouseX - prevMouseX;
  } else {
    if (mouseXOnDown != null) {
      containerVelocity =
        ((2 * mouseMass) / (mouseMass + containerMass)) * mouseVelocity +
        ((containerMass - mouseMass) / (mouseMass + containerMass)) *
          containerVelocity;

      const maxVelocity = 60;

      if (containerVelocity > maxVelocity) {
        containerVelocity = maxVelocity;
      } else if (containerVelocity < -maxVelocity) {
        containerVelocity = -maxVelocity;
      }

      mouseXOnDown = null;
      mouseVelocity = 0;
    }
  }

  prevMouseX = mouseX;
};

const updateContainer = () => {
  const boundRight = -container.offsetWidth + window.innerWidth - 85;

  const isOutBound = containerPosition > 0 || containerPosition < boundRight;

  if (!isMouseDown) {
    const mu = 0.04;
    const g = 10;
    const flictionForce = containerMass * g * mu;
    const flictionA = flictionForce / containerMass;

    if (containerVelocity > 0) {
      containerVelocity -= flictionA;
      if (containerVelocity < 0) {
        containerVelocity = 0;
      }
    } else if (containerVelocity < 0) {
      containerVelocity += flictionA;
      if (containerVelocity > 0) {
        containerVelocity = 0;
      }
    }

    if (isOutBound) {
      const k = 0.01;
      const restLength = containerPosition > 0 ? 0 : boundRight;
      const currentLength = containerPosition;
      const dragForce = 1 * k * (restLength - currentLength);

      const dragForceA = dragForce / containerMass;
      containerVelocity += dragForce;

      const nextPosition = containerPosition + containerVelocity;

      if (containerPosition < boundRight && nextPosition > boundRight) {
        containerVelocity = 0;
        containerPosition = boundRight;
      } else if (containerPosition > 0 && nextPosition < 0) {
        containerVelocity = 0;
        containerPosition = 0;
      }
    }
  }

  containerPosition =
    containerPosition +
    containerVelocity +
    (isOutBound ? mouseVelocity / 2 : mouseVelocity);

  container.style.transform = `translate(${containerPosition}px)`;
};

const addOpacityWhenImageInBound = () => {
  if (!imagesElement) {
    return;
  }

  imagesElement.forEach((imageElement, index) => {
    const { left, right, width } =
      imageElement.children[0].getBoundingClientRect();
    if (index === 0) {
      //console.log('left', left, width);
    }
    if (left <= -width || right >= window.innerWidth + width) {
      if (imageElement.classList.contains("show")) {
        imageElement.classList.remove("show");
      }
    } else {
      if (!imageElement.classList.contains("show")) {
        imageElement.classList.add("show");
      }
    }
  });
};

const loop = () => {
  if (imageHasLoaded) {
    addOpacityWhenImageInBound();
    calculateMouseMomentum();
    updateContainer();
  }
  window.requestAnimationFrame(() => {
    loop();
  });
};

loop();

// SCROLL

(() => {
  let panels = document.querySelectorAll(".panel").length;
  let scrollDirection;
  let hold = false;

  let wheelHandler = (e) => {
    if (e.deltaY < 0) scrollDirection = "down";
    if (e.deltaY > 0) scrollDirection = "up";
    e.stopPropagation();
  };

  function scrollHandler(obj) {
    // let panel = e.target.closest('.panel');
    let pan;
    let slength = 0;
    let step = 100;
    let vh = window.innerHeight / 100;
    let vmin = Math.min(window.innerHeight, window.innerWidth) / 100;
    let plength;

    if (
      (this !== undefined && this.id === "wrapper") ||
      (obj !== undefined && obj.id === "wrapper")
    ) {
      pan = this || obj;
      plength = parseInt(pan.offsetHeight / vh);
    }
    if (pan === undefined) {
      return;
    }
    plength = plength || parseInt(pan.offsetHeight / vmin);
    slength = parseInt(pan.style.transform.replace("translateY(", ""));
    if (
      scrollDirection === "up" &&
      Math.abs(slength) < plength - plength / panels
    ) {
      slength = slength - step;
    } else if (scrollDirection === "down" && slength < 0) {
      slength = slength + step;
    } else if (scrollDirection === "top") {
      slength = 0;
    }
    // console.log(pan);
    if (hold === false) {
      hold = true;
      pan.style.transform = "translateY(" + slength + "vh)";
      setTimeout(() => (hold = false), 1000);
    }
  }

  let _swipe = (obj) => {
    var swdir,
      sX,
      sY,
      dX,
      dY,
      threshold = 100,
      slack = 50,
      alT = 500,
      elT,
      stT;
    obj.addEventListener(
      "touchstart",
      function (e) {
        var tchs = e.changedTouches[0];
        swdir = "none";
        sX = tchs.pageX;
        sY = tchs.pageY;
        stT = new Date().getTime();
      },
      false
    );

    obj.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
      },
      false
    );

    obj.addEventListener(
      "touchend",
      function (e) {
        var tchs = e.changedTouches[0];
        dX = tchs.pageX - sX;
        dY = tchs.pageY - sY;
        elT = new Date().getTime() - stT;
        if (elT <= alT) {
          if (Math.abs(dX) >= threshold && Math.abs(dY) <= slack) {
            swdir = dX < 0 ? "left" : "right";
          } else if (Math.abs(dY) >= threshold && Math.abs(dX) <= slack) {
            swdir = dY < 0 ? "up" : "down";
          }
          if (obj.id === "well") {
            if (swdir === "up") {
              scdir = swdir;
              scrollHandler(obj);
            } else if (
              swdir === "down" &&
              obj.style.transform !== "translateY(0)"
            ) {
              scdir = swdir;
              scrollHandler(obj);
            }
            e.stopPropagation();
          }
        }
      },
      false
    );
  };

  let wrapper = document.getElementById("wrapper");
  wrapper.style.transform = `translateY(0)`;
  wrapper.addEventListener("wheel", wheelHandler);
  wrapper.addEventListener("wheel", scrollHandler);

  _swipe(wrapper);
  var tops = document.querySelectorAll(".top");
  for (var i = 0; i < tops.length; i++) {
    tops[i].addEventListener("click", function () {
      scdir = "top";
      scrollHandler(well);
    });
  }
})();

// LOAD SLIDERS

const loadElements = document.querySelectorAll(".js-load");

const displayLoadElement = (element) => {
  element.classList.add("loaded");
};

const handleLoadAnimation = (e) => {
  loadElements.forEach((el) => displayLoadElement(el));
};

window.addEventListener("load", handleLoadAnimation);

//  SCROLL SLIDERS

let observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.intersectionRatio === 1) {
          entry.target.classList.add("scrolled");
        } else if (entry.intersectionRatio === 0) {
          observer.unobserve(entry);
        } else {
          entry.target.classList.remove("scrolled");
        }
      }
    });
  },
  { threshold: [0, 1], rootMargin: "400px" }
);

document.querySelectorAll(".js-scroll").forEach((e) => {
  observer.observe(e);
});
