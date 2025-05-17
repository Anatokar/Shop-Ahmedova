class Animal {
    private string _name;

    public Animal(string name){
        _name = name;
    }
    public void MakeSound(){
        Console.WriteLine("Неизвестный звук");
    }

}
class Dog : Animal {
    public Dog(string name) : base(name)
    public override void MakeSound(){
        Console.WriteLine("Гав-гав!");
    }
}
class Cat : Animal {
    public override void MakeSound(){
        Console.WriteLine("Мяу!");
    }
}
public class Program {
    public static void Main(){
        Animal animals = new Animal[]{new Dog("pop"), new Cat(), new Dog("kok")};
        foreach(Animal a in animals){
            a.MakeSound();
        }
    }
}