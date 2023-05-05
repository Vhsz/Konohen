const WIDTH=40, HEIGHT=40, WIDTH_BLOCK=10, HEIGHT_BLOCK=10,Xn =194, Yn=114;
let canvas = document.querySelector("#canvas"),
    context = canvas.getContext("2d"),
    Ts = []
function rnd(min, max) 
{
  /*
    Функция случайного числа в диапазоне min - max
    Аргументы:
    min : тип данных (вещественное) - от какого числа начинается диапазон случайных чисел
    max : тип данных (вещественное) - каким числом заканчивается диапазон случайных чисел
  */
  return ( min + Math.random() * (max - min) );
}
function cArr(x,y) 
{
  /*
    Наполнение массива примеров обучающей выборки.
    Аргумент:
    x : тип данных (целое число) - количество строк в пространстве
    y : тип данных (целое число) - количество ячеек в строке
  
  let step = 2;
  for(let height = 153; height<x;height+=step)
  {    
    for(let weight = 45; weight<y;weight+=step)
    {
      let ibm = weight/(height/100)**2; //Расчет индекса массы тела
      Ts.push([height/x,weight/y,ibm/49]); //Формирование обучающего примера
    }
  }
 */ 
  let colors = [[255,0,0],[0,255,0],[0,0,255],[255,255,255]];
      Ts=colors.map( (array,indexArray) => array.map( value => value/255))
   /* */
} 
class Neuron
{
  /*
    Класс описывающий один нейрон:
    Аргументы:
    X : тип данных (целочисленный) - количество входных воздействий 
    x : тип данных (целочисленный) - координата нейрона по горизонтали
    y : тип данных (целочисленный) - координата нейрона по вертикали  
  */
  constructor(X,x,y)
  {
      this.x=x;
      this.y=y;
      this.w = Array(X).fill(0).map( value=> rnd(0,1) );  // Инициализация весовых коэффициентов
      this.color="rgb(255,255,255)";                      // Инициализация цвета нейрона
  }
  render()
  {
      /*
        Метод осуществляющий отображение нейрона на сетке ввиде квадрата
      */
      context.fillStyle = this.color                              //Установление цвета для отрисовки
      context.clearRect(this.x,this.y,WIDTH_BLOCK,HEIGHT_BLOCK);  //Очистка пространства квадратика на канве
      context.fillRect(this.x,this.y,WIDTH_BLOCK,HEIGHT_BLOCK);   //Прорисовка квадратика на карте
  }
  averageWeights()
  {
    /*
      Метод рассчитывающий среднее значение весовых коэффициентов.
    */
    this.avg = this.w.reduce( (accum,value) => accum+value, 0 ) / this.w.length;
  }
  recolor()
  {
    /*
      Метод изменяющий цвет квадратика на карте
    */
    this.averageWeights() //Расчет среднего значения при использовании оттенков серого
    this.color = "rgb("+this.w[0]*255+","+this.w[1]*255+","+this.w[2]*255+")";  //Устанавливается цвет
    // this.color = "rgb("+this.avg*255+","+this.avg*255+","+this.avg*255+")";
    this.render()         //Прорисовка нейрона на карте
  }
}
class SOM
{
  /*
    Класс описывающий самоорганизующуюся карту Кохонена
    Аргументы:
    n : тип данных (целочисленный) - количество входных воздействий
  */
  constructor(n)
  {
    this.neurons = [];  //Инициализация массива нейронов
    this.x=1;           //Инициализации координаты x
    this.y=1;           //Инициализации координаты y
    this.sigma0 = Math.max(WIDTH*WIDTH_BLOCK,HEIGHT*HEIGHT_BLOCK)/2; //Константа 
    this.lambda = 0;    //Инициализации ламбда
    this.sigma=0;       //Инициализации сигма
    this.L=0;           
    this.theta = 0;
    this.r = 0;
    this.neighbors=[];  //Инициализации массива соседей
    for(let i =0; i< WIDTH*HEIGHT; i++) //Пробегаемся по всем ячейкам сетки
    {
      this.neurons.push(new Neuron(n,this.x,this.y)) //Наполняем массив нейронов экземплярами класса
      if(this.x+WIDTH_BLOCK < WIDTH*WIDTH_BLOCK)     //Если еще не дошли до правой стенки
      {
        this.x+=WIDTH_BLOCK+1;                       //Тогда устанавливаем нейрон в данной строке
      }
      else                                           //Иначе 
      {
        this.x=1;                                    //Переходим к левой стенке
        this.y+=HEIGHT_BLOCK+1;                      //Переходим на новую строку
      }

    }
    this.neurons.forEach( neuron => neuron.render() ) //Прорисовываем все нейроны
  }
  recolor()
  {
    /*
      Метод отображающий текущее состояние карты.
    */
    this.neurons.forEach(value => value.recolor())
  }
  indexMinimum(D)
  {
    /*
      Метод для определения минимального расcтояния между нейронами и входным воздействием
      Аргументы:
      D : тип данных (список) - значения полученные по формуле корня квадратного суммы квадрата разности
    */
    let index=0,min = D[index]; // Устанавливаем первый жлемент списка как минимальный
    for(let i = 1;i<D.length;i++) //Пробегаемся по всем элементам кроме первого
    {
      if(D[i]<min)  // Если текущий элемент меньше предыдущего минимума
      {
        index = i;  // Тогда меняем индекс минимального элемента
        min = D[i]; // Изменяем значение минимального элемента
      }
    }
    return index; //Возвращаем индекс минимального элемента
  }
  neuronWinner(y)
  {  
    /*
      Метод для определения нейрона победителя (ближайшего к входному воздействию)
      Аргументы:
      y     : тип данных (список) - входное воздействие
    */
    this.D=[]; //Список для хранения растояний между нейронами и входным воздействием
    this.neurons.forEach( (neuron,indexNeuron) => // Перебор всех нейронов
      {
        this.s=0;  // Инициализация переменной для суммирования
        y.forEach( (input, indexInput) =>  // Перебор данных входного воздействия
          {
            this.s+=(input - neuron.w[indexInput])**2; // Суммирование разности квадратов
          }        
        )
        this.D.push(Math.sqrt( this.s ));  // Добавление расстояния в список
      }
    )
    return this.indexMinimum(this.D); // Возвращение индекса победившего нейрона
  }
  search(y)
  {
    /*
      Метод определения нейронов победителей (ближайшегых к входноым воздействиям)
      Аргументы:
      y     : тип данных (список) - входные воздействия
    */
    this.neurons.forEach(value=>{value.color="rgb(255,255,255)";value.render()}) //Очищаем цвета карты
    y.forEach( value => this.neurons[this.neuronWinner(value)].recolor())        //Красим только нейроны победители
    
  }
  learn(T=10,L0=0.33)
  {
    /*
      Метод обучения нейронов карты.
      Аргументы:
      T : тип данных (целочисленный) - количество итераций обучения
      L0 : тип данных (вещественный) - начальное значение коэффициента скорости обучения
    */
    this.lambda = T/Math.log(this.sigma0); //Вычисление лямбда
    Ts.forEach( (value,indexValue) =>  //Пробегаемся по всем примерам
      {
        this.currentWinner = this.neurons[this.neuronWinner(value)] //Получаем нейрон победителя
        for(let t = 0; t < T; t++)     //Обучаем T раз на каждом примере
        {
          this.sigma = this.sigma0 * Math.exp(-(t/this.lambda)) //Вычисляем сигма
          this.L = L0 * Math.exp(-(t/this.lambda))              //Вычисляем коэффициент скорости обучения
          this.neighbors = this.neurons.filter( neuron =>  Math.sqrt( (neuron.x-this.currentWinner.x)**2+(neuron.y-this.currentWinner.y)**2  ) < this.sigma);//Формируем массив соседей победившего нейрона
          this.neighbors.forEach( (neuron, indexNeuron) =>  //Пробегаемся по всем соседям
            { 
              //Узнаем расстояние до каждого соседа
              this.r = Math.sqrt( (neuron.x-this.currentWinner.x)**2+(neuron.y-this.currentWinner.y)**2  )
              this.theta = Math.exp(-((this.r**2) / (2*(this.sigma**2))))  //Вычисление тета
              
              neuron.w.forEach( (weight,indexWeight) =>  //Пробегаемся по всем весовым коэффициентам соседа
                {
                  this.neighbors[indexNeuron].w[indexWeight] += this.theta * this.L * (value[indexWeight] - weight); //Корректируем весовые коэффициенты
                }                
              )
            }                             
          )
        }      
      } 
    )
    this.recolor()//Перерисовываем карту после обучения
  }
}
nn = new SOM(3) // Создаем экземпляр классе самоорганизующейся карты




window.onload = () => {cArr(Xn,Yn);} //Вызываем функцию для инициализации входных воздействий