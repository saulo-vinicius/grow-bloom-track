
export type Locale = 'en' | 'pt' | 'es';

export type TranslationKey =
  | 'app.title'
  | 'app.tagline'
  | 'nav.home'
  | 'nav.plants'
  | 'nav.calculator'
  | 'nav.settings'
  | 'auth.signin'
  | 'auth.signup'
  | 'auth.email'
  | 'auth.password'
  | 'auth.google'
  | 'auth.continue'
  | 'auth.or'
  | 'auth.noAccount'
  | 'auth.hasAccount'
  | 'auth.forgotPassword'
  | 'auth.signout'
  | 'home.welcome'
  | 'home.yourPlants'
  | 'home.addPlant'
  | 'home.viewAll'
  | 'home.myDashboard'
  | 'home.recentUpdates'
  | 'plants.myPlants'
  | 'plants.all'
  | 'plants.indoor'
  | 'plants.outdoor'
  | 'plants.addNew'
  | 'plants.noPlants'
  | 'plants.search'
  | 'plants.sort'
  | 'plants.filter'
  | 'plants.lastUpdate'
  | 'plants.details'
  | 'plant.name'
  | 'plant.species'
  | 'plant.location'
  | 'plant.indoor'
  | 'plant.outdoor'
  | 'plant.addedOn'
  | 'plant.lastWatered'
  | 'plant.temperature'
  | 'plant.humidity'
  | 'plant.ppm'
  | 'plant.growthPhase'
  | 'plant.updateStats'
  | 'plant.updatePhoto'
  | 'plant.delete'
  | 'plant.save'
  | 'plant.cancel'
  | 'calc.title'
  | 'calc.description'
  | 'calc.plantType'
  | 'calc.growthPhase'
  | 'calc.environment'
  | 'calc.waterQuality'
  | 'calc.calculate'
  | 'calc.results'
  | 'calc.recommended'
  | 'calc.optimizeNow'
  | 'calc.saveRecipe'
  | 'calc.applyToPlant'
  | 'premium.title'
  | 'premium.subtitle'
  | 'premium.feature1'
  | 'premium.feature2'
  | 'premium.feature3'
  | 'premium.feature4'
  | 'premium.feature5'
  | 'premium.cta'
  | 'premium.price'
  | 'premium.perMonth'
  | 'premium.upgrade'
  | 'premium.alreadyPremium'
  | 'settings.title'
  | 'settings.language'
  | 'settings.theme'
  | 'settings.notifications'
  | 'settings.account'
  | 'settings.help'
  | 'settings.about'
  | 'settings.logout';

type TranslationsType = {
  [key in Locale]: {
    [key in TranslationKey]: string;
  };
};

export const translations: TranslationsType = {
  en: {
    'app.title': 'BoraGrow',
    'app.tagline': 'Track, optimize, and nurture your plants',
    'nav.home': 'Home',
    'nav.plants': 'My Plants',
    'nav.calculator': 'Calculator',
    'nav.settings': 'Settings',
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.google': 'Continue with Google',
    'auth.continue': 'Continue',
    'auth.or': 'or',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
    'auth.forgotPassword': 'Forgot password?',
    'auth.signout': 'Sign Out',
    'home.welcome': 'Welcome back',
    'home.yourPlants': 'Your Plants',
    'home.addPlant': 'Add Plant',
    'home.viewAll': 'View All',
    'home.myDashboard': 'My Dashboard',
    'home.recentUpdates': 'Recent Updates',
    'plants.myPlants': 'My Plants',
    'plants.all': 'All',
    'plants.indoor': 'Indoor',
    'plants.outdoor': 'Outdoor',
    'plants.addNew': 'Add New Plant',
    'plants.noPlants': 'No plants yet. Add your first one!',
    'plants.search': 'Search plants',
    'plants.sort': 'Sort',
    'plants.filter': 'Filter',
    'plants.lastUpdate': 'Last update',
    'plants.details': 'Plant Details',
    'plant.name': 'Name',
    'plant.species': 'Species',
    'plant.location': 'Location',
    'plant.indoor': 'Indoor',
    'plant.outdoor': 'Outdoor',
    'plant.addedOn': 'Added on',
    'plant.lastWatered': 'Last watered',
    'plant.temperature': 'Temperature',
    'plant.humidity': 'Humidity',
    'plant.ppm': 'PPM',
    'plant.growthPhase': 'Growth phase',
    'plant.updateStats': 'Update Stats',
    'plant.updatePhoto': 'Update Photo',
    'plant.delete': 'Delete Plant',
    'plant.save': 'Save',
    'plant.cancel': 'Cancel',
    'calc.title': 'Growth Calculator',
    'calc.description': 'Optimize your plant\'s growth with personalized recommendations',
    'calc.plantType': 'Plant Type',
    'calc.growthPhase': 'Growth Phase',
    'calc.environment': 'Environment',
    'calc.waterQuality': 'Water Quality',
    'calc.calculate': 'Calculate',
    'calc.results': 'Results',
    'calc.recommended': 'Recommended',
    'calc.optimizeNow': 'Optimize Now',
    'calc.saveRecipe': 'Save Recipe',
    'calc.applyToPlant': 'Apply to Plant',
    'premium.title': 'Upgrade to Premium',
    'premium.subtitle': 'Unlock advanced features for optimal plant growth',
    'premium.feature1': 'Advanced Growth Analytics',
    'premium.feature2': 'Unlimited Plant Profiles',
    'premium.feature3': 'Custom Growth Recipes',
    'premium.feature4': 'Growth History Export',
    'premium.feature5': 'Priority Support',
    'premium.cta': 'Get Premium Today',
    'premium.price': '$4.99',
    'premium.perMonth': 'per month',
    'premium.upgrade': 'Upgrade Now',
    'premium.alreadyPremium': 'You\'re a Premium User',
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.notifications': 'Notifications',
    'settings.account': 'Account',
    'settings.help': 'Help & Support',
    'settings.about': 'About',
    'settings.logout': 'Logout'
  },
  pt: {
    'app.title': 'BoraGrow',
    'app.tagline': 'Acompanhe, otimize e cuide de suas plantas',
    'nav.home': 'Início',
    'nav.plants': 'Minhas Plantas',
    'nav.calculator': 'Calculadora',
    'nav.settings': 'Configurações',
    'auth.signin': 'Entrar',
    'auth.signup': 'Cadastrar',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.google': 'Continuar com Google',
    'auth.continue': 'Continuar',
    'auth.or': 'ou',
    'auth.noAccount': 'Não tem uma conta?',
    'auth.hasAccount': 'Já tem uma conta?',
    'auth.forgotPassword': 'Esqueceu sua senha?',
    'auth.signout': 'Sair',
    'home.welcome': 'Bem-vindo de volta',
    'home.yourPlants': 'Suas Plantas',
    'home.addPlant': 'Adicionar Planta',
    'home.viewAll': 'Ver Todas',
    'home.myDashboard': 'Meu Painel',
    'home.recentUpdates': 'Atualizações Recentes',
    'plants.myPlants': 'Minhas Plantas',
    'plants.all': 'Todas',
    'plants.indoor': 'Internas',
    'plants.outdoor': 'Externas',
    'plants.addNew': 'Adicionar Nova Planta',
    'plants.noPlants': 'Sem plantas ainda. Adicione sua primeira!',
    'plants.search': 'Buscar plantas',
    'plants.sort': 'Ordenar',
    'plants.filter': 'Filtrar',
    'plants.lastUpdate': 'Última atualização',
    'plants.details': 'Detalhes da Planta',
    'plant.name': 'Nome',
    'plant.species': 'Espécie',
    'plant.location': 'Localização',
    'plant.indoor': 'Interna',
    'plant.outdoor': 'Externa',
    'plant.addedOn': 'Adicionada em',
    'plant.lastWatered': 'Última rega',
    'plant.temperature': 'Temperatura',
    'plant.humidity': 'Umidade',
    'plant.ppm': 'PPM',
    'plant.growthPhase': 'Fase de crescimento',
    'plant.updateStats': 'Atualizar Estatísticas',
    'plant.updatePhoto': 'Atualizar Foto',
    'plant.delete': 'Excluir Planta',
    'plant.save': 'Salvar',
    'plant.cancel': 'Cancelar',
    'calc.title': 'Calculadora de Crescimento',
    'calc.description': 'Otimize o crescimento da sua planta com recomendações personalizadas',
    'calc.plantType': 'Tipo de Planta',
    'calc.growthPhase': 'Fase de Crescimento',
    'calc.environment': 'Ambiente',
    'calc.waterQuality': 'Qualidade da Água',
    'calc.calculate': 'Calcular',
    'calc.results': 'Resultados',
    'calc.recommended': 'Recomendado',
    'calc.optimizeNow': 'Otimizar Agora',
    'calc.saveRecipe': 'Salvar Receita',
    'calc.applyToPlant': 'Aplicar à Planta',
    'premium.title': 'Atualize para Premium',
    'premium.subtitle': 'Desbloqueie recursos avançados para o crescimento ideal das plantas',
    'premium.feature1': 'Análise Avançada de Crescimento',
    'premium.feature2': 'Perfis de Plantas Ilimitados',
    'premium.feature3': 'Receitas de Crescimento Personalizadas',
    'premium.feature4': 'Exportação de Histórico de Crescimento',
    'premium.feature5': 'Suporte Prioritário',
    'premium.cta': 'Obtenha Premium Hoje',
    'premium.price': 'R$24,99',
    'premium.perMonth': 'por mês',
    'premium.upgrade': 'Atualizar Agora',
    'premium.alreadyPremium': 'Você é um Usuário Premium',
    'settings.title': 'Configurações',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.notifications': 'Notificações',
    'settings.account': 'Conta',
    'settings.help': 'Ajuda e Suporte',
    'settings.about': 'Sobre',
    'settings.logout': 'Sair'
  },
  es: {
    'app.title': 'BoraGrow',
    'app.tagline': 'Rastrea, optimiza y cuida tus plantas',
    'nav.home': 'Inicio',
    'nav.plants': 'Mis Plantas',
    'nav.calculator': 'Calculadora',
    'nav.settings': 'Configuración',
    'auth.signin': 'Iniciar Sesión',
    'auth.signup': 'Registrarse',
    'auth.email': 'Correo',
    'auth.password': 'Contraseña',
    'auth.google': 'Continuar con Google',
    'auth.continue': 'Continuar',
    'auth.or': 'o',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.hasAccount': '¿Ya tienes una cuenta?',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.signout': 'Cerrar Sesión',
    'home.welcome': 'Bienvenido de nuevo',
    'home.yourPlants': 'Tus Plantas',
    'home.addPlant': 'Añadir Planta',
    'home.viewAll': 'Ver Todas',
    'home.myDashboard': 'Mi Panel',
    'home.recentUpdates': 'Actualizaciones Recientes',
    'plants.myPlants': 'Mis Plantas',
    'plants.all': 'Todas',
    'plants.indoor': 'Interiores',
    'plants.outdoor': 'Exteriores',
    'plants.addNew': 'Añadir Nueva Planta',
    'plants.noPlants': '¡Aún no hay plantas. Añade tu primera!',
    'plants.search': 'Buscar plantas',
    'plants.sort': 'Ordenar',
    'plants.filter': 'Filtrar',
    'plants.lastUpdate': 'Última actualización',
    'plants.details': 'Detalles de la Planta',
    'plant.name': 'Nombre',
    'plant.species': 'Especie',
    'plant.location': 'Ubicación',
    'plant.indoor': 'Interior',
    'plant.outdoor': 'Exterior',
    'plant.addedOn': 'Añadida el',
    'plant.lastWatered': 'Último riego',
    'plant.temperature': 'Temperatura',
    'plant.humidity': 'Humedad',
    'plant.ppm': 'PPM',
    'plant.growthPhase': 'Fase de crecimiento',
    'plant.updateStats': 'Actualizar Estadísticas',
    'plant.updatePhoto': 'Actualizar Foto',
    'plant.delete': 'Eliminar Planta',
    'plant.save': 'Guardar',
    'plant.cancel': 'Cancelar',
    'calc.title': 'Calculadora de Crecimiento',
    'calc.description': 'Optimiza el crecimiento de tu planta con recomendaciones personalizadas',
    'calc.plantType': 'Tipo de Planta',
    'calc.growthPhase': 'Fase de Crecimiento',
    'calc.environment': 'Entorno',
    'calc.waterQuality': 'Calidad del Agua',
    'calc.calculate': 'Calcular',
    'calc.results': 'Resultados',
    'calc.recommended': 'Recomendado',
    'calc.optimizeNow': 'Optimizar Ahora',
    'calc.saveRecipe': 'Guardar Receta',
    'calc.applyToPlant': 'Aplicar a Planta',
    'premium.title': 'Actualiza a Premium',
    'premium.subtitle': 'Desbloquea funciones avanzadas para un crecimiento óptimo de las plantas',
    'premium.feature1': 'Análisis Avanzado de Crecimiento',
    'premium.feature2': 'Perfiles de Plantas Ilimitados',
    'premium.feature3': 'Recetas de Crecimiento Personalizadas',
    'premium.feature4': 'Exportación del Historial de Crecimiento',
    'premium.feature5': 'Soporte Prioritario',
    'premium.cta': 'Obtén Premium Hoy',
    'premium.price': '€4.99',
    'premium.perMonth': 'por mes',
    'premium.upgrade': 'Actualizar Ahora',
    'premium.alreadyPremium': 'Eres un Usuario Premium',
    'settings.title': 'Configuración',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.notifications': 'Notificaciones',
    'settings.account': 'Cuenta',
    'settings.help': 'Ayuda y Soporte',
    'settings.about': 'Acerca de',
    'settings.logout': 'Cerrar Sesión'
  }
};
