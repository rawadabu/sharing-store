import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { exhaustMap, map, take, tap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  constructor(
    private http: HttpClient,
    private recipeService: RecipeService,
    private authService: AuthService
  ) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http
      .put(
        'https://recipe-book-5c34a-default-rtdb.firebaseio.com/recipes.json',
        recipes
      )
      .subscribe((response) => {
        console.log(response);
      });
  }

  // take(1) means I only want to take one value from that observable, and thereafter it should automatically unsubscribe (takes the latest user)
  fetchRecipes() {
    return this.authService.user
      .pipe(
        take(1),
        exhaustMap((user) => {
          console.log('User:', user);
          return this.http.get<Recipe[]>(
            'https://recipe-book-5c34a-default-rtdb.firebaseio.com/recipes.json',
            {
              params: new HttpParams().set('auth', user.token),
            }
          );
        }),
        map((recipes) => {
          console.log('Fetched Recipes:', recipes);
          return recipes.map((recipe) => {
            return {
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : [],
            };
          });
        }),
        tap((recipes) => {
          console.log('Setting Recipes:', recipes);
          this.recipeService.setRecipes(recipes);
        })
      )
      .subscribe(
        (success) => {
          console.log('Fetch successful:', success);
          // Additional logic if needed
        },
        (error) => {
          console.error('Fetch error:', error);
          // Additional error handling if needed
        }
      );
  }
}
