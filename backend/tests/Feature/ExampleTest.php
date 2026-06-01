<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_la_route_health_repond(): void
    {
        $this->get('/up')->assertOk();
    }
}
