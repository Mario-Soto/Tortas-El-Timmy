const CacheEstatico = "st-1";
const CacheInmutable = "in-1";
const CacheDinamico = "din-1";

function LimpiarCache(cacheName, numeroItems) {
	caches.open(cacheName).then((cache) => {
		return cache.keys().then((keys) => {
			//console.log(keys);
			if (keys.length > numeroItems)
				cache.delete(keys[0]).then(LimpiarCache(cacheName, numeroItems)); //Recursividad la funcion se llama a si misma
		});
	});
}

self.addEventListener("install", (e) => {
	const cacheProm = caches.open(CacheEstatico).then((cache) => {
		cache.addAll([
			"/Tortas-El-Timmy/",
            "/Tortas-El-Timmy/index.html",
            "/Tortas-El-Timmy/confirmacion.html",
            "/Tortas-El-Timmy/pedidos.html",
            "/Tortas-El-Timmy/css/style.css",
            "/Tortas-El-Timmy/css/tortas.css",
            "/Tortas-El-Timmy/js/app.js",
            "/Tortas-El-Timmy/js/confirmar.js",
            "/Tortas-El-Timmy/js/pedidos.js",
		]);
	});
	//cache inmutable no se modifica
	const cacheInm = caches.open(CacheInmutable).then((cache) => {
		cache.addAll([
			"/Tortas-El-Timmy/manifest.json",
            "/Tortas-El-Timmy/css/bootstrap.min.css",
            "/Tortas-El-Timmy/css/fontawesome.min.css",
            "/Tortas-El-Timmy/js/bootstrap.bundle.min.js",
            "/Tortas-El-Timmy/js/fontawesome.min.js",
            "/Tortas-El-Timmy/js/jquery.min.js",
            "/Tortas-El-Timmy/js/cookies.min.js",
            "/Tortas-El-Timmy/images/menu.png",
			"/Tortas-El-Timmy/images/error404.png",
			"/Tortas-El-Timmy/404.html",
		]);
	});
	e.waitUntil(Promise.all([cacheProm, cacheInm]));
	self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
	//Network with cache fallback
	const respuesta = fetch(e.request)
		.then((res) => {
			//la app solicita un recurso de internet
			if (!res)
				//si falla (false or null)
				return caches
					.match(e.request) //lo busca y lo regresa al cache
					.then((newRes) => {
						if (!newRes) {
							if (/\.(png|jpg|webp|jfif)$/.test(e.request.url)) {
								return caches.match("/Tortas-El-Timmy/images/error404.png");
							}
							return caches.match("/Tortas-El-Timmy/404.html");
						}
						return newRes;
					});

			caches.match(e.request).then((cacheRes) => {
				if (!cacheRes) {
					caches.open(CacheDinamico).then((cache) => {
						//abre el cache dinamico
						cache.add(e.request.url); //mete el recurso que no existia en el cache
						LimpiarCache(CacheDinamico, 100); // limpia hasta 100 elementos de cache
					});
				}
			});
			return res; //devuelve la respuesta
		})
		.catch((err) => {
			// en caso de que encuetre algun error devuleve el archivo de cache
			return caches
				.match(e.request) //lo busca y lo regresa al cache
				.then((newRes) => {
					if (!newRes) {
						if (/\.(png|jpg|webp|jfif)$/.test(e.request.url)) {
							return caches.match("/Tortas-El-Timmy/images/error404.png");
						}
						return caches.match("/Tortas-El-Timmy/404.html");
					}
					return newRes;
				});
		});
	e.respondWith(respuesta);
});